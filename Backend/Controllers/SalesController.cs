using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("sales")]

public class SalesController : ControllerBase
{
    private readonly SalesService _salesService;

    public SalesController(SalesService salesService)
    {
        _salesService = salesService;
    }

    [HttpGet]
    public ActionResult<List<Sale>> GetAllSales()
    {

        var sales = _salesService.GetAll();
        return Ok(sales);
    }

    [HttpGet("{id}")]
    public ActionResult<Sale> GetSaleById(int id)
    {
        var sale = _salesService.GetById(id);

        if (sale == null)
        {
            return NotFound(new { message = $"Sale with ID {id} not found." });
        }

        return Ok(sale);
    }

    [HttpPost]
    public ActionResult AddSale(Sale sale)
    {
        try
        {
            _salesService.AddSale(sale);

            return CreatedAtAction(
                nameof(GetSaleById),
                new { id = sale.TicketId },
                sale);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

/*     [HttpPut("{id}")]
    public ActionResult UpdateSale(int id, Sale sale)
    {
        if (id != sale.TicketId)
        {
            return BadRequest(new { message = "Ticket ID in URL does not match the ID in the request body." });
        }
        else if (sale.InitialAmount < 0 || sale.FinalAmount < 0)
        {
            return BadRequest("Amounts cannot be negative.");
        }

        _salesService.UpdateSale(sale);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteSale(int id)
    {
        _salesService.DeleteSale(id);
        return NoContent();
    } */
}