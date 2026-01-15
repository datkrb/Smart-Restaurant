import { PrismaClient, PaymentMethod, PaymentStatus, OrderStatus, TableSessionStatus } from "@prisma/client";
import Stripe from "stripe";
import { env } from "process";

const prisma = new PrismaClient();
export const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2022-11-15",
});

// create payment intent
export const createPaymentIntent = async (orderId: string) =>{
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
        include: {
            items: true,
        },
    });
    if (!order) {
        throw new Error("Order not found");
    }
    if(order.totalAmount <= 0){
        throw new Error("Order total amount is less than or equal to 0");
    }

    let payment = await prisma.payment.findUnique({
        where: {
            orderId: orderId,
        },
    })
    if(!payment){
        payment = await prisma.payment.create({
            data: {
                orderId: orderId,
                amount: order.totalAmount,
                method: PaymentMethod.STRIPE,
                status: PaymentStatus.PENDING,
            },
        })
    }
    else{
        if(payment.status === PaymentStatus.PENDING){
            return payment;
        }
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalAmount,
        currency: "vnd",
        metadata: {
            orderId: orderId,
            paymentId: payment.id,
        },
        automatic_payment_methods: {
            enabled: true,
        },       
    })
    return {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,

    }
}

//process success payment
export const processSuccessPayment = async (orderId: string, method: PaymentMethod) => {
    const payment = await prisma.payment.update({
        where: {
            orderId: orderId,
        },
        data: {
            status: PaymentStatus.PAID,
            method: method,
            paidAt: new Date(),
        },
    })

    const updatedOrder = await prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status: OrderStatus.COMPLETED,
        },
    })

    if(updatedOrder.tableSessionId){
        await prisma.tableSession.update({
            where: {
                id: updatedOrder.tableSessionId,
            },
            data: {
                status: TableSessionStatus.CLOSED,
                endedAt: new Date(),
            },
        })
    }
    return true;
}
