using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("product/{productId}")]
        public IActionResult GetByProduct(int productId)
        {
            var reviews = _context.Reviews
                .Include(r => r.Customer)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedDate)
                .Select(r => new
                {
                    r.Id,
                    r.ProductId,
                    r.CustomerId,
                    r.Rating,
                    r.Comment,
                    r.ImageUrl,
                    r.Reply,
                    r.ReplyDate,
                    r.CreatedDate,
                    CustomerName = r.Customer.FullName
                })
                .ToList();

            var avgRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 1) : 0;

            return Ok(new
            {
                averageRating = avgRating,
                totalReviews = reviews.Count,
                reviews
            });
        }

        public class CreateReviewRequest
        {
            public int ProductId { get; set; }
            public int CustomerId { get; set; }
            public int Rating { get; set; }
            public string Comment { get; set; }
        }

        [HttpPost]
        public IActionResult Create([FromForm] CreateReviewRequest request, IFormFile? uploadImage)
        {
            var purchased = _context.OrderDetails
                .Any(od => od.Order.CustomerId == request.CustomerId
                        && od.Order.Status == 3
                        && od.ProductId == request.ProductId);

            if (!purchased)
                return BadRequest(new { message = "Bạn chỉ có thể đánh giá sản phẩm đã mua và nhận hàng!" });

            var existing = _context.Reviews.Any(r =>
                r.ProductId == request.ProductId && r.CustomerId == request.CustomerId);

            if (existing)
                return BadRequest(new { message = "Bạn đã đánh giá sản phẩm này rồi!" });

            var review = new Review
            {
                ProductId = request.ProductId,
                CustomerId = request.CustomerId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedDate = DateTime.Now
            };

            if (uploadImage != null)
            {
                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                string uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/reviews/");

                if (!Directory.Exists(uploadFolder))
                    Directory.CreateDirectory(uploadFolder);

                using var stream = new FileStream(Path.Combine(uploadFolder, fileName), FileMode.Create);
                uploadImage.CopyTo(stream);

                review.ImageUrl = fileName;
            }

            _context.Reviews.Add(review);
            _context.SaveChanges();

            return Ok(new { message = "Đánh giá thành công!" });
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromForm] UpdateReviewRequest request, IFormFile? uploadImage)
        {
            var review = _context.Reviews.Find(id);
            if (review == null)
                return NotFound(new { message = "Không tìm thấy đánh giá!" });

            review.Rating = request.Rating;
            review.Comment = request.Comment;

            if (uploadImage != null)
            {
                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                string uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/reviews/");

                if (!Directory.Exists(uploadFolder))
                    Directory.CreateDirectory(uploadFolder);

                using var stream = new FileStream(Path.Combine(uploadFolder, fileName), FileMode.Create);
                uploadImage.CopyTo(stream);

                if (!string.IsNullOrEmpty(review.ImageUrl))
                {
                    string oldPath = Path.Combine(uploadFolder, review.ImageUrl);
                    if (System.IO.File.Exists(oldPath))
                        System.IO.File.Delete(oldPath);
                }

                review.ImageUrl = fileName;
            }

            review.CreatedDate = DateTime.Now;
            _context.SaveChanges();

            return Ok(new { message = "Cập nhật đánh giá thành công!" });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id, [FromQuery] int customerId)
        {
            var review = _context.Reviews.Find(id);
            if (review == null)
                return NotFound(new { message = "Không tìm thấy đánh giá!" });

            if (review.CustomerId != customerId)
                return BadRequest(new { message = "Bạn chỉ có thể xóa đánh giá của chính mình!" });

            if (!string.IsNullOrEmpty(review.ImageUrl))
            {
                string uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/reviews/");
                string filePath = Path.Combine(uploadFolder, review.ImageUrl);
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);
            }

            _context.Reviews.Remove(review);
            _context.SaveChanges();

            return Ok(new { message = "Xóa đánh giá thành công!" });
        }
    }
}

public class UpdateReviewRequest
{
    public int Rating { get; set; }
    public string Comment { get; set; }
}
