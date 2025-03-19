using ilet.Server.Context;
using ilet.Server.Interfaces;
using ilet.Server.Models;

namespace IletApi.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _db;

        public UserService(AppDbContext db)
        {
            _db = db;
        }

        public List<User> GetAll()
        {
            return _db.Users.ToList();
        }

        public (bool success, string token, string nickname) CreateOrGetUser(User user)
        {
            var existingUser = _db.Users.FirstOrDefault(u => u.Email == user.Email);

            if (existingUser != null)
            {
                if (existingUser.Password == user.Password)
                {
                    if (string.IsNullOrEmpty(existingUser.Nickname))
                    {
                        existingUser.Nickname = existingUser.Email;
                        _db.SaveChanges();
                    }
                    return (true, "dummy-token", existingUser.Nickname);
                }
                return (false, "", "");
            }

            user.Nickname = user.Email;
            _db.Users.Add(user);
            _db.SaveChanges();
            return (true, "dummy-token", user.Nickname);
        }
        public (bool success, User user) GetUser(string token)
        {
            if (token != "dummy-token")
                return (false, null);

            var user = _db.Users.FirstOrDefault(); // burası token'a göre userId çözümüne döner normalde
            if (user == null)
                return (false, null);

            return (true, user);
        }
    }
}
