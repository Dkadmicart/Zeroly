// server/services/emailService.js
import { Resend } from 'resend';
import logger from '../utils/logger.js';

let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}

/**
 * Sends a notification email when an item matches a user's wishlist
 */
export const sendWishlistMatchEmail = async (userEmail, userName, itemName, itemUrl) => {
    try {
        if (!resend) {
            logger.warn('Resend API key missing. Skipping wishlist email to %s', userEmail);
            return;
        }

        logger.info('Sending wishlist match email to %s for item %s', userEmail, itemName);

        const { data, error } = await resend.emails.send({
            from: 'Zeroly Alerts <onboarding@resend.dev>', // Use verified domain in production
            to: userEmail,
            subject: `✨ Match Found: ${itemName} on Zeroly!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #10b981;">Good News, ${userName}!</h2>
                    <p style="color: #475569; font-size: 16px;">
                        An item matching your wishlist was just posted on Zeroly:
                    </p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0; color: #0f172a;">${itemName}</h3>
                    </div>
                    <p style="color: #475569; font-size: 16px;">
                        Act fast and request it before someone else does!
                    </p>
                    <a href="${itemUrl}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                        View Item
                    </a>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        Zeroly Community • Reducing Waste Together
                    </p>
                </div>
            `
        });

        if (error) {
            throw error;
        }

        logger.debug('Email sent successfully: %s', data?.id);
    } catch (error) {
        logger.error({ err: error }, 'Failed to send wishlist email to %s', userEmail);
    }
};
