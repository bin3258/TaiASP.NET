using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
/* 
 * sinh viên: Lê Xuân Tài
 * Lớp: CNTT K47
 * Ngày tạo: 15/05/2026
 * Mô tả: xây dựng chức năng quản lý tài khoản người dùng, 
*/
public class User
{
    // đối tượng lưu trữ thông tin tài khoản người dùng trong hệ thống
    public int Id { get; set; } 
    public string Username { get; set; } // lưu tên đăng nhập của người dùng
    public string PasswordHash { get; set; }// lưu mật khẩu đã được mã hóa
    public string FullName { get; set; } // lưu họ và tên người dùng
    public string Role { get; set; } // Quản trị viên hoặc Biên tập viên
}
