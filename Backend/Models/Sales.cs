namespace Backend.Models;
using System.ComponentModel.DataAnnotations;

// The Sale class represents a sales record with properties for ticket ID, order ID, initial amount, final amount, and a comment.
public class Sale
{
    public int TicketId { get; set; }
    public int OrderId {get; set; }
    [Range(typeof(decimal), "0", "1000000")]
    public decimal InitialAmount {get; set; }
    [Range(typeof(decimal), "0", "1000000")]
    public decimal FinalAmount {get; set; }
    public string Comment { get; set; } = "";
    public string? Agent { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}