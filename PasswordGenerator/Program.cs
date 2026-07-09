using BCrypt.Net;

Console.Write("Enter password: ");

string? password = Console.ReadLine();

if (string.IsNullOrWhiteSpace(password))
{
    Console.WriteLine("Password cannot be empty.");
    return;
}

string hash = BCrypt.Net.BCrypt.HashPassword(password);

Console.WriteLine();
Console.WriteLine("Generated Hash:");
Console.WriteLine(hash);