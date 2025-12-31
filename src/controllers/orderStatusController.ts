import { Request, Response } from "express";

export const getStatusExplanation = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });


    
    const statusExplanations: { [key: string]: string } = {
      // Order progression
      'pending': 'Your order has been received and is waiting to be confirmed by the restaurant.',
      'received': 'We have received your order and are preparing it for processing.',
      'confirmed': 'The restaurant has confirmed your order and will start preparing it shortly.',
      'processing': 'Your order is being processed and will move to preparation soon.',
      'accepted': 'Your order has been accepted by the restaurant.',
      
      // Kitchen stages
      'preparing': 'Our chefs are currently preparing your food with fresh ingredients.',
      'cooking': 'Your meal is being cooked right now in our kitchen.',
      'baking': 'Your items are in the oven, getting that perfect finish.',
      'assembling': 'Your order is being assembled and will be ready for packaging soon.',
      'quality_check': 'Our team is performing a final quality check on your order.',
      
      // Ready stages
      'ready': 'Your order is ready! It will be packaged for delivery or pickup.',
      'packaged': 'Your order has been packaged and is ready for delivery.',
      'pickup_ready': 'Your order is ready for pickup at the restaurant.',
      
      // Delivery stages
      'driver_assigned': 'A delivery driver has been assigned to your order.',
      'driver_dispatched': 'The driver is on their way to pick up your order.',
      'picked_up': 'Your order has been picked up by the driver.',
      'out_for_delivery': 'Your food is on the way! Our delivery partner is bringing it to you.',
      'arriving_soon': 'Your delivery is arriving in the next few minutes!',
      'nearby': 'The driver is in your neighborhood and will arrive shortly.',
      
      // Completion
      'delivered': 'Your order has been successfully delivered. Enjoy your meal!',
      'completed': 'Order completed successfully. Thank you for your purchase!',
      'picked_up_customer': 'You have successfully picked up your order.',
      
      // Issues and delays
      'delayed': 'Your order is taking longer than expected. We appreciate your patience.',
      'on_hold': 'Your order is temporarily on hold. The restaurant will update you shortly.',
      'waiting_for_ingredients': 'We\'re waiting for fresh ingredients to prepare your order.',
      'restaurant_busy': 'The restaurant is experiencing high volume. Your order will be prepared soon.',
      
      // Payment statuses
      'awaiting_payment': 'Waiting for payment confirmation. Your order will proceed once payment is verified.',
      'payment_processing': 'Your payment is being processed.',
      'payment_completed': 'Payment received! Your order is now being processed.',
      'payment_failed': 'Payment was unsuccessful. Please check your payment method and try again.',
      'refund_initiated': 'Refund has been initiated for your order.',
      
      // Cancellation and issues
      'cancelled': 'This order has been cancelled. You may have initiated cancellation or the restaurant was unable to fulfill it.',
      'cancelled_by_restaurant': 'The restaurant had to cancel your order. You will be refunded if payment was made.',
      'cancelled_by_customer': 'You have cancelled this order.',
      'failed': 'We encountered an issue processing your order. Please try again or contact support.',
      'rejected': 'The restaurant was unable to accept your order.',
      
      // Refunds
      'refunded': 'This order has been refunded. The amount should reflect in your account soon.',
      'partial_refund': 'A partial refund has been issued for your order.',
      
      // Special
      'scheduled': 'Your order is scheduled for a future time. We\'ll start preparing it closer to your chosen time.',
      'pre_order': 'This is a pre-order. It will be prepared at the scheduled time.',
    };

    // Clean the status string
    const cleanStatus = status.toLowerCase().trim().replace(/\s+/g, '_');
    
    // Try exact match first
    let explanation = statusExplanations[cleanStatus];
    
    
    if (!explanation) {
      for (const [key, value] of Object.entries(statusExplanations)) {
        if (cleanStatus.includes(key) || key.includes(cleanStatus)) {
          explanation = value;
          break;
        }
      }
    }
    
    
    if (!explanation) {
      explanation = `Your order is marked as "${status}". This means it's progressing through our order processing system. We'll update you as it moves through preparation and delivery.`;
    }

    res.status(200).json({ explanation });

  } catch (error: any) {
    console.error(
      "[Status Controller] ERROR in getStatusExplanation:",
      error.message
    );

    res.status(500).json({ 
      message: "Failed to generate status explanation",
      explanation: "We're having trouble getting status details. Please check back in a few moments."
    });
  }
};