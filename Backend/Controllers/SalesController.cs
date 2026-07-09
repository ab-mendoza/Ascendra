using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers;

[ApiController]
[Route("sales")]
[Authorize]

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
            string? fullName = User.FindFirst("FullName")?.Value;

            sale.Agent = fullName;

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
    
}