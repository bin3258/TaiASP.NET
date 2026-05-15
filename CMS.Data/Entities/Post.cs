using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
/* 
 * sinh viên: Lê Xuân Tài
 * Lớp: CNTT K47
 * Ngày tạo: 15/05/2026
 * Mô tả: xây dựng chức năng quản lý bài viết, 
*/

namespace CMS.Data.Entities
{
    public class Post
    {
        // đối tượng lưu trữ thông tin bài viết trong hệ thống CMS
        public int Id { get; set; }
        public string Title { get; set; } // Tiêu đề bài viết
        public string Content { get; set; } // Nội dung chi tiết
        public string ImageUrl { get; set; } // Hình ảnh đại diện
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Khóa ngoại liên kết tới Category
        public int CategoryId { get; set; }
        public virtual Category Category { get; set; }
    }
}

