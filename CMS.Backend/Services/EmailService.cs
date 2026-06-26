using System.Text;
using System.Text.Json;
using CMS.Backend.Settings;
using CMS.Data.Entities;
using Microsoft.Extensions.Options;

namespace CMS.Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(HttpClient httpClient, IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendOrderConfirmationAsync(Order order, Customer customer, List<OrderDetail> orderDetails)
        {
            _logger.LogInformation("Bắt đầu gửi email xác nhận đơn #{OrderId} đến {Email}", order.Id, customer.Email);

            var total = orderDetails.Sum(d => d.UnitPrice * d.Quantity);
            var date = order.OrderDate.ToString("dd/MM/yyyy HH:mm");

            var itemsHtml = new StringBuilder();
            foreach (var item in orderDetails)
            {
                var productName = item.Product?.Name ?? $"Sản phẩm #{item.ProductId}";
                var subtotal = item.UnitPrice * item.Quantity;
                itemsHtml.Append($@"
                <tr>
                    <td style='padding:10px;border-bottom:1px solid #eee;'>{productName}</td>
                    <td style='padding:10px;border-bottom:1px solid #eee;text-align:center;'>{item.Quantity}</td>
                    <td style='padding:10px;border-bottom:1px solid #eee;text-align:right;'>{item.UnitPrice:N0}₫</td>
                    <td style='padding:10px;border-bottom:1px solid #eee;text-align:right;'>{subtotal:N0}₫</td>
                </tr>");
            }

            var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;'>
    <table role='presentation' width='100%' style='background:#f5f5f5;padding:30px 10px;'>
        <tr>
            <td align='center'>
                <table role='presentation' width='600' style='background:#ffffff;border-radius:8px;overflow:hidden;'>
                    <tr>
                        <td style='background:#1a1a2e;padding:25px 30px;text-align:center;'>
                            <h1 style='color:#ffffff;margin:0;font-size:22px;'>Xác nhận đơn hàng</h1>
                            <p style='color:#e8a87c;margin:5px 0 0;font-size:13px;'>TaiCMS - Cửa hàng dinh dưỡng</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:30px;'>
                            <p style='font-size:15px;color:#333;'>Xin chào <strong>{customer.FullName}</strong>,</p>
                            <p style='font-size:14px;color:#555;'>Đơn hàng của bạn đã được đặt thành công.</p>

                            <table role='presentation' width='100%' style='background:#faf7f5;border-radius:6px;padding:15px;margin:15px 0;'>
                                <tr>
                                    <td style='font-size:13px;color:#888;padding:4px 0;'>Mã đơn hàng:</td>
                                    <td style='font-size:14px;font-weight:bold;color:#1a1a2e;padding:4px 0;'>#{order.Id}</td>
                                </tr>
                                <tr>
                                    <td style='font-size:13px;color:#888;padding:4px 0;'>Ngày đặt:</td>
                                    <td style='font-size:14px;color:#333;padding:4px 0;'>{date}</td>
                                </tr>
                                <tr>
                                    <td style='font-size:13px;color:#888;padding:4px 0;'>Địa chỉ giao:</td>
                                    <td style='font-size:14px;color:#333;padding:4px 0;'>{customer.Address}</td>
                                </tr>
                                <tr>
                                    <td style='font-size:13px;color:#888;padding:4px 0;'>Số điện thoại:</td>
                                    <td style='font-size:14px;color:#333;padding:4px 0;'>{customer.Phone}</td>
                                </tr>
                            </table>

                            <h3 style='color:#1a1a2e;font-size:15px;margin:20px 0 10px;'>Chi tiết đơn hàng</h3>
                            <table role='presentation' width='100%' style='border-collapse:collapse;'>
                                <thead>
                                    <tr style='background:#1a1a2e;color:#ffffff;font-size:13px;'>
                                        <th style='padding:10px;text-align:left;'>Sản phẩm</th>
                                        <th style='padding:10px;text-align:center;'>SL</th>
                                        <th style='padding:10px;text-align:right;'>Đơn giá</th>
                                        <th style='padding:10px;text-align:right;'>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsHtml}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan='3' style='padding:12px 10px;text-align:right;font-weight:bold;font-size:14px;'>Tổng cộng:</td>
                                        <td style='padding:12px 10px;text-align:right;font-weight:bold;font-size:16px;color:#e8a87c;'>{total:N0}₫</td>
                                    </tr>
                                </tfoot>
                            </table>

                            {(string.IsNullOrEmpty(order.Notes) ? "" : $@"
                            <div style='margin-top:15px;padding:12px;background:#fff8f0;border-radius:6px;'>
                                <strong style='font-size:13px;color:#888;'>Ghi chú:</strong>
                                <p style='font-size:14px;color:#555;margin:4px 0 0;'>{order.Notes}</p>
                            </div>")}

                            <p style='font-size:13px;color:#888;margin-top:20px;'>Cảm ơn bạn đã mua sắm tại TaiCMS!</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

            var payload = new
            {
                personalizations = new[]
                {
                    new
                    {
                        to = new[]
                        {
                            new { email = customer.Email, name = customer.FullName }
                        }
                    }
                },
                from = new { email = _settings.SenderEmail, name = _settings.SenderName },
                subject = $"Xác nhận đơn hàng #{order.Id} - TaiCMS",
                content = new[]
                {
                    new { type = "text/html", value = html }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.sendgrid.com/v3/mail/send")
            {
                Headers = { { "Authorization", $"Bearer {_settings.SendGridApiKey}" } },
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            _logger.LogInformation("Đang gửi request đến SendGrid API...");
            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("SendGrid thất bại: {StatusCode} - {Error}", response.StatusCode, errorBody);
            }
            else
            {
                _logger.LogInformation("Gửi email thành công đến {Email} cho đơn #{OrderId}", customer.Email, order.Id);
            }
        }

        public async Task SendPasswordResetAsync(Customer customer, string newPassword)
        {
            _logger.LogInformation("Bắt đầu gửi email reset mật khẩu đến {Email}", customer.Email);

            var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;'>
    <table role='presentation' width='100%' style='background:#f5f5f5;padding:30px 10px;'>
        <tr>
            <td align='center'>
                <table role='presentation' width='600' style='background:#ffffff;border-radius:8px;overflow:hidden;'>
                    <tr>
                        <td style='background:#1a1a2e;padding:25px 30px;text-align:center;'>
                            <h1 style='color:#ffffff;margin:0;font-size:22px;'>Khôi phục mật khẩu</h1>
                            <p style='color:#e8a87c;margin:5px 0 0;font-size:13px;'>TaiCMS - Cửa hàng dinh dưỡng</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:30px;'>
                            <p style='font-size:15px;color:#333;'>Xin chào <strong>{customer.FullName}</strong>,</p>
                            <p style='font-size:14px;color:#555;'>Mật khẩu mới của bạn là:</p>
                            <div style='background:#faf7f5;border-radius:8px;padding:15px 20px;margin:15px 0;text-align:center;'>
                                <span style='font-size:22px;font-weight:bold;color:#1a1a2e;'>{newPassword}</span>
                            </div>
                            <p style='font-size:13px;color:#888;'>Vui lòng đăng nhập và đổi mật khẩu ngay sau khi đăng nhập.</p>
                            <p style='font-size:13px;color:#888;margin-top:20px;'>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
                            <p style='font-size:13px;color:#888;margin-top:20px;'>Cảm ơn bạn đã mua sắm tại TaiCMS!</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

            var payload = new
            {
                personalizations = new[]
                {
                    new
                    {
                        to = new[]
                        {
                            new { email = customer.Email, name = customer.FullName }
                        }
                    }
                },
                from = new { email = _settings.SenderEmail, name = _settings.SenderName },
                subject = "Khôi phục mật khẩu - TaiCMS",
                content = new[]
                {
                    new { type = "text/html", value = html }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.sendgrid.com/v3/mail/send")
            {
                Headers = { { "Authorization", $"Bearer {_settings.SendGridApiKey}" } },
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            _logger.LogInformation("Đang gửi request reset mật khẩu đến SendGrid API...");
            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("SendGrid thất bại: {StatusCode} - {Error}", response.StatusCode, errorBody);
            }
            else
            {
                _logger.LogInformation("Gửi email reset mật khẩu thành công đến {Email}", customer.Email);
            }
        }
    }
}
