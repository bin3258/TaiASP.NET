using CMS.Backend.Services;
using CMS.Data;
using CMS.Data.DTOs;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderDetailController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<OrderDetailController> _logger;

        public OrderDetailController(ApplicationDbContext context, IEmailService emailService, ILogger<OrderDetailController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }
        // ==========================
        // CLASS NHẬN GHI CHÚ TỪ REACT
        // ==========================

        public class CheckoutRequest
        {
            public string? Notes { get; set; }
        }

        [HttpPost("checkout/{customerId}")]
        public async Task<IActionResult> Checkout(int customerId, [FromBody] CheckoutRequest request)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(x => x.Id == customerId);

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            // Bắt buộc nhập thông tin

            if (string.IsNullOrWhiteSpace(customer.FullName))
            {
                return BadRequest(new
                {
                    message = "Vui lòng nhập họ tên"
                });
            }

            if (string.IsNullOrWhiteSpace(customer.Phone))
            {
                return BadRequest(new
                {
                    message = "Vui lòng nhập số điện thoại"
                });
            }

            if (string.IsNullOrWhiteSpace(customer.Address))
            {
                return BadRequest(new
                {
                    message = "Vui lòng nhập địa chỉ giao hàng"
                });
            }

            // Lấy giỏ hàng

            var carts = await _context.Carts
                .Where(x => x.CustomerId == customerId)
                .ToListAsync();

            if (!carts.Any())
            {
                return BadRequest(new
                {
                    message = "Giỏ hàng đang trống"
                });
            }

            // Kiểm tra tồn kho trước

            foreach (var item in carts)
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(x => x.Id == item.ProductId);

                if (product == null)
                {
                    return BadRequest(new
                    {
                        message = "Sản phẩm không tồn tại"
                    });
                }

                if (product.StockQuantity < item.Quantity)
                {
                    return BadRequest(new
                    {
                        message = $"Sản phẩm {product.Name} chỉ còn {product.StockQuantity} sản phẩm"
                    });
                }
            }

            // Tạo đơn hàng

            var order = new Order
            {
                CustomerId = customerId,
                OrderDate = DateTime.Now,
                Status = 0, // Chờ duyệt
                Notes = request?.Notes ?? ""
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Tạo chi tiết đơn

            foreach (var item in carts)
            {
                var product = await _context.Products
                    .FirstAsync(x => x.Id == item.ProductId);

                var detail = new OrderDetail
                {
                    OrderId = order.Id,
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                };

                _context.OrderDetails.Add(detail);

                // Trừ kho

                product.StockQuantity -= item.Quantity;
            }

            // Xóa giỏ hàng

            _context.Carts.RemoveRange(carts);

            await _context.SaveChangesAsync();

            // Gửi email xác nhận

            try
            {
                var orderDetails = await _context.OrderDetails
                    .Include(od => od.Product)
                    .Where(od => od.OrderId == order.Id)
                    .ToListAsync();

                _logger.LogInformation("Bắt đầu gửi email cho đơn #{OrderId} -> {Email}", order.Id, customer.Email);
                await _emailService.SendOrderConfirmationAsync(order, customer, orderDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gửi email thất bại cho đơn #{OrderId}", order.Id);
            }

            return Ok(new
            {
                message = "Đặt hàng thành công",
                orderId = order.Id
            });
        }
        [HttpPut("customer-info/{customerId}")]
        public IActionResult UpdateCustomerInfo(
    int customerId,
    [FromBody] UpdateCustomerInfoDto request)
        {
            var customer = _context.Customers
                .FirstOrDefault(x => x.Id == customerId);

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new
                {
                    message = "Họ tên không được để trống"
                });
            }

            if (string.IsNullOrWhiteSpace(request.Phone))
            {
                return BadRequest(new
                {
                    message = "Số điện thoại không được để trống"
                });
            }

            if (string.IsNullOrWhiteSpace(request.Address))
            {
                return BadRequest(new
                {
                    message = "Địa chỉ không được để trống"
                });
            }

            customer.FullName = request.FullName;
            customer.Phone = request.Phone;
            customer.Address = request.Address;

            _context.SaveChanges();

            return Ok(new
            {
                message = "Cập nhật thành công"
            });
        }
        [HttpGet("checkout-info/{customerId}")]
        public IActionResult CheckoutInfo(int customerId)
        {
            var customer = _context.Customers
                .Where(x => x.Id == customerId)
                .Select(x => new
                {
                    x.Id,
                    x.FullName,
                    x.Phone,
                    x.Address,
                    x.Email
                })
                .FirstOrDefault();

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            return Ok(customer);
        }
    }
}