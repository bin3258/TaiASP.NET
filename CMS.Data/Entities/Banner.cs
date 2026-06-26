using System;

namespace CMS.Data.Entities
{
    /// <summary>
    /// Banner entity for homepage/slider management.
    /// </summary>
    public class Banner
    {
        // Khóa chính
        public int Id { get; set; }

        // Khởi tạo mặc định để tránh lỗi CS8618
        public string Title { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Thứ tự hiển thị (nhỏ đến lớn)
        public int DisplayOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}