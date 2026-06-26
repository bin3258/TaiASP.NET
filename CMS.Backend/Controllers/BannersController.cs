using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BannersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BannersController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class BannerDto
        {
            public int Id { get; set; }
            public string Title { get; set; } = string.Empty;
            public string ImageUrl { get; set; } = string.Empty;
            public string? Description { get; set; }
            public int DisplayOrder { get; set; }
            public bool IsActive { get; set; }
        }

        // GET: api/Banners
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<BannerDto>>> GetAll()
        {
            var banners = await _context.Banners
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new BannerDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    ImageUrl = x.ImageUrl,
                    Description = x.Description,
                    DisplayOrder = x.DisplayOrder,
                    IsActive = x.IsActive
                })
                .ToListAsync();

            return Ok(banners);
        }

        // GET: api/Banners/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<BannerDto>> GetById(int id)
        {
            var banner = await _context.Banners
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (banner == null)
                return NotFound();

            return Ok(new BannerDto
            {
                Id = banner.Id,
                Title = banner.Title,
                ImageUrl = banner.ImageUrl,
                Description = banner.Description,
                DisplayOrder = banner.DisplayOrder,
                IsActive = banner.IsActive
            });
        }

        // POST: api/Banners
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] BannerDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (model.DisplayOrder < 0)
            {
                var maxOrder = await _context.Banners
                    .MaxAsync(x => (int?)x.DisplayOrder) ?? -1;

                model.DisplayOrder = maxOrder + 1;
            }
            else
            {
                await ShiftOrdersForInsertAsync(model.DisplayOrder);
            }

            var banner = new Banner
            {
                Title = model.Title,
                ImageUrl = model.ImageUrl,
                Description = model.Description,
                DisplayOrder = model.DisplayOrder,
                IsActive = model.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();

            model.Id = banner.Id;

            return CreatedAtAction(nameof(GetById),
                new { id = banner.Id }, model);
        }

        // PUT: api/Banners/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] BannerDto model)
        {
            if (id != model.Id)
                return BadRequest();

            var banner = await _context.Banners.FindAsync(id);

            if (banner == null)
                return NotFound();

            banner.Title = model.Title;
            banner.Description = model.Description;
            banner.IsActive = model.IsActive;

            if (!string.IsNullOrWhiteSpace(model.ImageUrl))
            {
                banner.ImageUrl = model.ImageUrl;
            }

            if (banner.DisplayOrder != model.DisplayOrder)
            {
                await ShiftOrdersForUpdateAsync(
                    banner.DisplayOrder,
                    model.DisplayOrder);

                banner.DisplayOrder = model.DisplayOrder;
            }

            banner.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Banners/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var banner = await _context.Banners.FindAsync(id);

            if (banner == null)
                return NotFound();

            _context.Banners.Remove(banner);

            await _context.SaveChangesAsync();

            var all = await _context.Banners
                .OrderBy(x => x.DisplayOrder)
                .ToListAsync();

            for (int i = 0; i < all.Count; i++)
            {
                all[i].DisplayOrder = i;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Banners/reorder
        [HttpPost("reorder")]
        [Authorize]
        public async Task<IActionResult> Reorder([FromBody] int[] orderedIds)
        {
            if (orderedIds == null || orderedIds.Length == 0)
                return BadRequest();

            var banners = await _context.Banners.ToListAsync();

            for (int i = 0; i < orderedIds.Length; i++)
            {
                var banner = banners.FirstOrDefault(x => x.Id == orderedIds[i]);

                if (banner != null)
                {
                    banner.DisplayOrder = i;
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task ShiftOrdersForInsertAsync(int newOrder)
        {
            var affected = await _context.Banners
                .Where(x => x.DisplayOrder >= newOrder)
                .ToListAsync();

            foreach (var item in affected)
            {
                item.DisplayOrder++;
            }

            await _context.SaveChangesAsync();
        }

        private async Task ShiftOrdersForUpdateAsync(
            int oldOrder,
            int newOrder)
        {
            if (newOrder == oldOrder)
                return;

            if (newOrder < oldOrder)
            {
                var affected = await _context.Banners
                    .Where(x =>
                        x.DisplayOrder >= newOrder &&
                        x.DisplayOrder < oldOrder)
                    .ToListAsync();

                foreach (var item in affected)
                {
                    item.DisplayOrder++;
                }
            }
            else
            {
                var affected = await _context.Banners
                    .Where(x =>
                        x.DisplayOrder > oldOrder &&
                        x.DisplayOrder <= newOrder)
                    .ToListAsync();

                foreach (var item in affected)
                {
                    item.DisplayOrder--;
                }
            }

            await _context.SaveChangesAsync();
        }
    }

}