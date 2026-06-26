using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoryProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class CategoryProductDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string? Description { get; set; }
            public string? ImageUrl { get; set; }
        }

        // GET: api/CategoryProducts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryProductDto>>> GetAll()
        {
            var list = await _context.CategoriesProducts
                .AsNoTracking()
                .Select(c => new CategoryProductDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    ImageUrl = c.ImageUrl
                })
                .ToListAsync();

            return Ok(list);
        }
    }
}
