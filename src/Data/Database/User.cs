using IOL.Helpers;

namespace VSH.Data.Database;

public class User : Base
{
	public User(string username) => Username = username;
	public string Username { get; set; }
	public string Password { get; set; }

	public void HashAndSetPassword(string password) {
		Password = PasswordHelper.HashPassword(password);
	}

	public bool VerifyPassword(string password) {
		return PasswordHelper.Verify(password, Password);
	}
}