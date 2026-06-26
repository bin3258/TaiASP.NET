using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
/* 
 * sinh viên: Lê Xuân Tài
 * Lớp: CNTT K47
 * Ngày tạo: 15/05/2026
 * Mô tả: xây dựng chức năng lưu trữ và quản lý các loại sản phẩm 
*/
using System.ComponentModel.DataAnnotations;
namespace CMS.Data.Entities
{

    public class CategoryProduct
    {
        // đối tượng dùng để lưu thông tin danh mục sản phẩm
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        [StringLength(100)]
        public string Name { get; set; }

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        // Quan hệ: Một danh mục có nhiều sản phẩm
        public virtual ICollection<Product>? Products { get; set; }
    }
}
