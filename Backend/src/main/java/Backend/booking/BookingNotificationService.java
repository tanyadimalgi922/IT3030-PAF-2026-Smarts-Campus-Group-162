package Backend.booking;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.InternetAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class BookingNotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BookingNotificationService.class);

    private final JavaMailSender mailSender;
    private final String mailFrom;
    private final String mailFromName;
    private final String verificationBaseUrl;

    public BookingNotificationService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:}") String mailFrom,
            @Value("${app.mail.from-name:Smart Campus Team}") String mailFromName,
            @Value("${app.booking.verification-base-url:http://localhost:8081/api/bookings}") String verificationBaseUrl
    ) {
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
        this.mailFromName = mailFromName;
        this.verificationBaseUrl = verificationBaseUrl;
    }

    public void sendApprovalEmail(ResourceBooking booking) {
        if (!StringUtils.hasText(booking.getUserEmail())) {
            return;
        }

        String verificationUrl = verificationBaseUrl + "/" + booking.getId() + "/verification";
        byte[] qrImage = tryGenerateQrCode(buildVerificationContent(booking, verificationUrl));
        String subject = "Booking Approved: " + booking.getResourceName();
        String html = """
                <html>
                <body style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;">
                  <h2 style="margin-bottom:8px;">Your booking has been approved</h2>
                  <p>Hello %s,</p>
                  <p>Your booking request for <strong>%s</strong> has been approved.</p>
                  <div style="background:#f8fafc;border:1px solid #dbeafe;border-radius:16px;padding:16px;margin:16px 0;">
                    <p style="margin:4px 0;"><strong>Date:</strong> %s</p>
                    <p style="margin:4px 0;"><strong>Time:</strong> %s - %s</p>
                    <p style="margin:4px 0;"><strong>Expected attendees:</strong> %d</p>
                    <p style="margin:4px 0;"><strong>Purpose:</strong> %s</p>
                    <p style="margin:4px 0;"><strong>Reviewed by:</strong> %s</p>
                    <p style="margin:4px 0;"><strong>Review note:</strong> %s</p>
                  </div>
                  <p>Please keep this QR code for booking verification.</p>
                  <p><img src="cid:bookingQrCode" alt="Booking QR code" style="width:220px;height:220px;border:1px solid #e2e8f0;border-radius:12px;padding:8px;background:#ffffff;" /></p>
                  <p>You can also verify the booking here:</p>
                  <p><a href="%s">%s</a></p>
                </body>
                </html>
                """.formatted(
                safe(booking.getUserName()),
                safe(booking.getResourceName()),
                safe(booking.getDate()),
                safe(booking.getStartTime()),
                safe(booking.getEndTime()),
                booking.getExpectedAttendees(),
                safe(booking.getPurpose()),
                safe(booking.getReviewedBy()),
                safe(booking.getReviewReason()),
                verificationUrl,
                verificationUrl
        );

        sendHtmlEmail(booking.getUserEmail(), subject, html, qrImage);
    }

    public void sendRejectionEmail(ResourceBooking booking) {
        if (!StringUtils.hasText(booking.getUserEmail())) {
            return;
        }

        String subject = "Booking Rejected: " + booking.getResourceName();
        String html = """
                <html>
                <body style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;">
                  <h2 style="margin-bottom:8px;">Your booking request was rejected</h2>
                  <p>Hello %s,</p>
                  <p>We could not approve your booking request for <strong>%s</strong>.</p>
                  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:16px;margin:16px 0;">
                    <p style="margin:4px 0;"><strong>Date:</strong> %s</p>
                    <p style="margin:4px 0;"><strong>Time:</strong> %s - %s</p>
                    <p style="margin:4px 0;"><strong>Reason:</strong> %s</p>
                    <p style="margin:4px 0;"><strong>Reviewed by:</strong> %s</p>
                  </div>
                </body>
                </html>
                """.formatted(
                safe(booking.getUserName()),
                safe(booking.getResourceName()),
                safe(booking.getDate()),
                safe(booking.getStartTime()),
                safe(booking.getEndTime()),
                safe(booking.getReviewReason()),
                safe(booking.getReviewedBy())
        );

        sendHtmlEmail(booking.getUserEmail(), subject, html, null);
    }

    private void sendHtmlEmail(String recipient, String subject, String html, byte[] qrImage) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(html, true);

            if (StringUtils.hasText(mailFrom)) {
                helper.setFrom(new InternetAddress(mailFrom, mailFromName).toString());
            }

            if (qrImage != null) {
                helper.addInline("bookingQrCode", new ByteArrayResource(qrImage), "image/png");
            }

            mailSender.send(message);
        } catch (MessagingException | MailException exception) {
            LOGGER.warn("Booking email could not be sent to {}", recipient, exception);
        }
    }

    private byte[] tryGenerateQrCode(String content) {
        try {
            BitMatrix matrix = new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, 320, 320);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (WriterException | IOException exception) {
            LOGGER.warn("Booking QR code could not be generated.", exception);
            return null;
        }
    }

    private String buildVerificationContent(ResourceBooking booking, String verificationUrl) {
        return """
                Smart Campus Booking Verification
                Booking ID: %s
                Resource: %s
                Student: %s
                Email: %s
                Date: %s
                Time: %s - %s
                Attendees: %d
                Verify: %s
                """.formatted(
                safe(booking.getId()),
                safe(booking.getResourceName()),
                safe(booking.getUserName()),
                safe(booking.getUserEmail()),
                safe(booking.getDate()),
                safe(booking.getStartTime()),
                safe(booking.getEndTime()),
                booking.getExpectedAttendees(),
                verificationUrl
        );
    }

    private String safe(String value) {
        return StringUtils.hasText(value) ? value : "-";
    }
}
