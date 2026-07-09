using Backend.Models;
using Npgsql;
using Microsoft.Extensions.Configuration;

namespace Backend.Services;

public class SalesService
{
    private readonly IConfiguration _configuration;
    public SalesService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public List<Sale> GetAll()
    {
        var sales = new List<Sale>();

        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        using var connection = new NpgsqlConnection(connectionString);

        connection.Open();

        string sql = @"SELECT
                        ""TicketId"",
                        ""OrderId"",
                        ""InitialAmount"",
                        ""FinalAmount"",
                        ""Comment"",
                        ""Agent"",
                        ""CreatedAt""
                    FROM ""Sales"";";

        using var command = new NpgsqlCommand(sql, connection);

        using var reader = command.ExecuteReader();

        while (reader.Read())
        {
            Sale sale = new Sale
            {
                TicketId = reader.GetInt32(0),
                OrderId = reader.GetInt32(1),
                InitialAmount = reader.GetDecimal(2),
                FinalAmount = reader.GetDecimal(3),
                Comment = reader.GetString(4),
                Agent = reader.GetString(5),
                CreatedAt = reader.GetDateTime(6)
            };

            sales.Add(sale);
        }

        return sales;
    }
    
    public Sale? GetById(int id)
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        using var connection = new NpgsqlConnection(connectionString);

        connection.Open();

        string sql = @"
        SELECT
            ""TicketId"",
            ""OrderId"",
            ""InitialAmount"",
            ""FinalAmount"",
            ""Comment"",
            ""Agent"",
            ""CreatedAt""
        FROM ""Sales""
        WHERE ""TicketId"" = @TicketId;";

        using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("@TicketId", id);

        using var reader = command.ExecuteReader();

        if (reader.Read())
        {
            return new Sale
            {
                TicketId = reader.GetInt32(0),
                OrderId = reader.GetInt32(1),
                InitialAmount = reader.GetDecimal(2),
                FinalAmount = reader.GetDecimal(3),
                Comment = reader.GetString(4),
                Agent = reader.IsDBNull(5) ? "" : reader.GetString(5),
                CreatedAt = reader.GetDateTime(6)
            };
        }

        return null;
    }
    public void AddSale(Sale sale)
    {
        if (sale.InitialAmount < 0)
            throw new ArgumentException("Initial amount cannot be negative.");

        if (sale.FinalAmount < 0)
            throw new ArgumentException("Final amount cannot be negative.");

        if (sale.FinalAmount < sale.InitialAmount)
            throw new ArgumentException("Final amount cannot be less than the initial amount.");

        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        using var connection = new NpgsqlConnection(connectionString);
        connection.Open();

        string sql = @"
        INSERT INTO ""Sales""
        (
            ""TicketId"",
            ""OrderId"",
            ""InitialAmount"",
            ""FinalAmount"",
            ""Comment"",
            ""Agent""
        )
        VALUES
        (
            @TicketId,
            @OrderId,
            @InitialAmount,
            @FinalAmount,
            @Comment,
            @Agent
        );";

        using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("@TicketId", sale.TicketId);
        command.Parameters.AddWithValue("@OrderId", sale.OrderId);
        command.Parameters.AddWithValue("@InitialAmount", sale.InitialAmount);
        command.Parameters.AddWithValue("@FinalAmount", sale.FinalAmount);
        command.Parameters.AddWithValue("@Comment", sale.Comment);
        command.Parameters.AddWithValue("@Agent", sale.Agent!);

        try
        {
            command.ExecuteNonQuery();
        }
        catch (PostgresException ex) when (ex.SqlState == "23505")
        {
            throw new InvalidOperationException(
                $"A sale with Ticket ID {sale.TicketId} already exists.");
        }
    }
}