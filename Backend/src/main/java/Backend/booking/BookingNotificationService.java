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
import java.io.UnsupportedEncodingException;
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
        String html = buildEmailShell(
                "Booking Approved",
                "Your booking has been confirmed and is ready for verification.",
                "APPROVED",
                "#047857",
                """
                <p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.7;">
                  Hello %s,
                </p>
                <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">
                  Your booking request for <strong style="color:#0f172a;">%s</strong> has been approved.
                  Please keep the QR code below available for verification on arrival.
                </p>
                %s
                <div style="margin:22px 0;padding:20px;border:1px solid #dbeafe;border-radius:20px;background:#f8fbff;text-align:center;">
                  <p style="margin:0 0 12px;color:#1e3a8a;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                    Verification QR Code
                  </p>
                  <img src="cid:bookingQrCode" alt="Booking QR code" style="width:220px;height:220px;border:1px solid #e2e8f0;border-radius:16px;padding:10px;background:#ffffff;" />
                  <p style="margin:14px 0 0;color:#475569;font-size:13px;line-height:1.6;">
                    Verification link:
                    <a href="%s" style="color:#2563eb;text-decoration:none;word-break:break-all;">%s</a>
                  </p>
                </div>
                <p style="margin:0;color:#475569;font-size:13px;line-height:1.7;">
                  If you did not make this request, please contact the Smart Campus administration team.
                </p>
                """.formatted(
                        safe(booking.getUserName()),
                        safe(booking.getResourceName()),
                        buildBookingSummary(booking, "#eff6ff", "#dbeafe"),
                        verificationUrl,
                        verificationUrl
                )
        );

        sendHtmlEmail(booking.getUserEmail(), subject, html, qrImage);
    }

    public void sendRejectionEmail(ResourceBooking booking) {
        if (!StringUtils.hasText(booking.getUserEmail())) {
            return;
        }

        String subject = "Booking Rejected: " + booking.getResourceName();
        String html = buildEmailShell(
                "Booking Rejected",
                "This request could not be approved at this time.",
                "REJECTED",
                "#b91c1c",
                """
                <p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.7;">
                  Hello %s,
                </p>
                <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">
                  We could not approve your booking request for <strong style="color:#0f172a;">%s</strong>.
                </p>
                %s
                <div style="margin:22px 0;padding:18px;border:1px solid #fecaca;border-radius:20px;background:#fff7f7;">
                  <p style="margin:0 0 8px;color:#991b1b;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                    Rejection Reason
                  </p>
                  <p style="margin:0;color:#7f1d1d;font-size:14px;line-height:1.7;">
                    %s
                  </p>
                </div>
                <p style="margin:0;color:#475569;font-size:13px;line-height:1.7;">
                  You may submit a new request with an updated date, time, or purpose if needed.
                </p>
                """.formatted(
                        safe(booking.getUserName()),
                        safe(booking.getResourceName()),
                        buildBookingSummary(booking, "#fff7ed", "#fed7aa"),
                        safe(booking.getReviewReason())
                )
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

            applyFrom(helper);

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

    private String buildEmailShell(String title, String subtitle, String badgeLabel, String badgeColor, String bodyContent) {
        return """
                <html>
                <body style="margin:0;padding:0;background:#eef4ff;font-family:Arial,'Segoe UI',sans-serif;color:#0f172a;">
                  <div style="padding:32px 16px;">
                    <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #dbe7ff;border-radius:28px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,0.08);">
                      <div style="padding:28px 32px;background:linear-gradient(135deg,#0b1f44 0%%,#1d4ed8 100%%);color:#ffffff;">
                        <p style="margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;opacity:0.85;">
                          Smart Campus
                        </p>
                        <table role="presentation" style="width:100%%;border-collapse:collapse;">
                          <tr>
                            <td style="vertical-align:top;">
                              <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:800;">%s</h1>
                              <p style="margin:10px 0 0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.82);">
                                %s
                              </p>
                            </td>
                            <td style="vertical-align:top;text-align:right;">
                              <span style="display:inline-block;padding:10px 14px;border-radius:999px;background:#ffffff;color:%s;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">
                                %s
                              </span>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <div style="padding:30px 32px 26px;">
                        %s
                      </div>
                      <div style="padding:18px 32px;border-top:1px solid #e5eefc;background:#f8fbff;">
                        <p style="margin:0;color:#64748b;font-size:12px;line-height:1.7;">
                          This is an automated message from Smart Campus. Please do not reply directly to this email.
                        </p>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(title, subtitle, badgeColor, badgeLabel, bodyContent);
    }

    private String buildBookingSummary(ResourceBooking booking, String backgroundColor, String borderColor) {
        return """
                <div style="margin:0 0 20px;padding:18px;border:1px solid %s;border-radius:20px;background:%s;">
                  <table role="presentation" style="width:100%%;border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#475569;" colspan="2">
                        Booking Summary
                      </td>
                    </tr>
                    %s
                    %s
                    %s
                    %s
                    %s
                    %s
                  </table>
                </div>
                """.formatted(
                borderColor,
                backgroundColor,
                detailRow("Resource", booking.getResourceName()),
                detailRow("Date", booking.getDate()),
                detailRow("Time", booking.getStartTime() + " - " + booking.getEndTime()),
                detailRow("Attendees", String.valueOf(booking.getExpectedAttendees())),
                detailRow("Purpose", booking.getPurpose()),
                detailRow("Reviewed By", booking.getReviewedBy())
        );
    }

    private String detailRow(String label, String value) {
        return """
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-size:13px;font-weight:600;width:150px;vertical-align:top;">%s</td>
                  <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:700;vertical-align:top;">%s</td>
                </tr>
                """.formatted(label, safe(value));
    }

    private void applyFrom(MimeMessageHelper helper) throws MessagingException {
        if (!StringUtils.hasText(mailFrom)) {
            return;
        }

        try {
            helper.setFrom(new InternetAddress(mailFrom, mailFromName).toString());
        } catch (UnsupportedEncodingException exception) {
            helper.setFrom(mailFrom);
        }
    }
}
