using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================
        // THÊM VÀO GIỎ HÀNG
        // POST: api/Carts/Add
        // ==========================
        [HttpPost("Add")]
        public IActionResult AddToCart([FromBody] Cart cart)
        {
            var customerExists = _context.Customers.Any(x => x.Id == cart.CustomerId);

            if (!customerExists)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            var product = _context.Products.Find(cart.ProductId);

            if (product == null)
            {
                return NotFound(new
                {
                    message = "Sản phẩm không tồn tại"
                });
            }

            var existingCart = _context.Carts.FirstOrDefault(x =>
                x.CustomerId == cart.CustomerId &&
                x.ProductId == cart.ProductId);

            if (existingCart != null)
            {
                existingCart.Quantity += cart.Quantity;
            }
            else
            {
                _context.Carts.Add(cart);
            }

            _context.SaveChanges();

            return Ok(new
            {
                message = "Đã thêm vào giỏ hàng"
            });
        }

        // ==========================
        // XEM GIỎ HÀNG
        // GET: api/Carts/{customerId}
        // ==========================
        [HttpGet("{customerId}")]
        public IActionResult GetCart(int customerId)
        {
            var customerExists = _context.Customers.Any(x => x.Id == customerId);

            if (!customerExists)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            var carts = _context.Carts
                .Include(x => x.Product)
                .Where(x => x.CustomerId == customerId)
                .Select(x => new
                {
                    CartId = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product.Name,
                    Price = x.Product.Price,
                    ImageUrl = x.Product.ImageUrl,
                    StockQuantity = x.Product.StockQuantity,
                    Quantity = x.Quantity,
                    Total = x.Quantity * x.Product.Price
                })
                .ToList();

            return Ok(carts);
        }

        // ==========================
        // CẬP NHẬT SỐ LƯỢNG
        // PUT: api/Carts/Update
        // ==========================
        [HttpPut("Update")]
        public IActionResult UpdateQuantity(int cartId, int quantity)
        {
            var cart = _context.Carts.Find(cartId);

            if (cart == null)
            {
                return NotFound();
            }

            if (quantity <= 0)
            {
                return BadRequest(new
                {
                    message = "Số lượng phải lớn hơn 0"
                });
            }

            cart.Quantity = quantity;

            _context.SaveChanges();

            return Ok(new
            {
                message = "Cập nhật thành công"
            });
        }

        // ==========================
        // XÓA 1 SẢN PHẨM KHỎI GIỎ
        // DELETE: api/Carts/{cartId}
        // ==========================
        [HttpDelete("{cartId}")]
        public IActionResult RemoveCartItem(int cartId)
        {
            var cart = _context.Carts.Find(cartId);

            if (cart == null)
            {
                return NotFound();
            }

            _context.Carts.Remove(cart);

            _context.SaveChanges();

            return Ok(new
            {
                message = "Đã xóa sản phẩm khỏi giỏ hàng"
            });
        }

        // ==========================
        // XÓA TOÀN BỘ GIỎ HÀNG
        // DELETE: api/Carts/Clear/{customerId}
        // ==========================
        [HttpDelete("Clear/{customerId}")]
        public IActionResult ClearCart(int customerId)
        {
            var customerExists = _context.Customers.Any(x => x.Id == customerId);

            if (!customerExists)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            var carts = _context.Carts
                .Where(x => x.CustomerId == customerId)
                .ToList();

            _context.Carts.RemoveRange(carts);

            _context.SaveChanges();

            return Ok(new
            {
                message = "Đã xóa toàn bộ giỏ hàng"
            });
        }
    }
}