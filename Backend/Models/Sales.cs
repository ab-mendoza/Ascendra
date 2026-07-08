namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

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