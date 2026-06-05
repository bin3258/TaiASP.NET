using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// API 1: Lấy toàn bộ sản phẩm
        /// GET: /api/Products
        /// </summary>
        [HttpGet]
        public IActionResult GetAll()
        {
            var products = _context.Products
                .OrderByDescending(p => p.Id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.ImageUrl
                })
                .ToList();

            return Ok(products);
        }

        /// <summary>
        /// API 2: Lấy sản phẩm theo danh mục
        /// GET: /api/Products/category/{categoryProductId}
        /// </summary>
        [HttpGet("category/{categoryProductId}")]
        public IActionResult GetByCategory(int categoryProductId)
        {
            var products = _context.Products
                .Where(p => p.CategoryProductId == categoryProductId)
                .OrderByDescending(p => p.Id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.ImageUrl
                })
                .ToList();

            return Ok(products);
        }

        /// <summary>
        /// API 3: Chi tiết sản phẩm
        /// GET: /api/Products/{id}
        /// </summary>
        [HttpGet("{id}")]
        public IActionResult GetDetail(int id)
        {
            var product = _context.Products
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.StockQuantity,
                    p.ImageUrl,
                    p.CategoryProductId
                })
                .FirstOrDefault();

            if (product == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy sản phẩm"
                });
            }

            return Ok(product);
        }
        /// <summary>
        /// API 4: Thêm sản phẩm
        /// POST: /api/Products
        /// </summary>
        [HttpPost]
        public IActionResult CreateProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Products.Add(product);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Thêm sản phẩm thành công",
                product.Id
            });
        }

        /// <summary>
        /// API 5: Cập nhật sản phẩm
        /// PUT: /api/Products/{id}
        /// </summary>
        [HttpPut("{id}")]
        public IActionResult UpdateProduct(int id, [FromBody] Product product)
        {
            var oldProduct = _context.Products.Find(id);

            if (oldProduct == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy sản phẩm"
                });
            }

            oldProduct.Name = product.Name;
            oldProduct.Description = product.Description;
            oldProduct.Price = product.Price;
            oldProduct.StockQuantity = product.StockQuantity;
            oldProduct.ImageUrl = product.ImageUrl;
            oldProduct.CategoryProductId = product.CategoryProductId;

            _context.SaveChanges();

            return Ok(new
            {
                message = "Cập nhật sản phẩm thành công"
            });
        }
        /// <summary>
        /// API 6: Xóa sản phẩm
        /// DELETE: /api/Products/{id}
        /// </summary>
        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(int id)
        {
            var product = _context.Products.Find(id);

            if (product == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy sản phẩm"
                });
            }

            _context.Products.Remove(product);

            _context.SaveChanges();

            return Ok(new
            {
                message = "Xóa sản phẩm thành công"
            });
        }
    }
}