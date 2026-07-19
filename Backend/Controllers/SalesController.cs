using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers;

// Marks this class as an API controller and enables automatic model binding/validation behavior.
[ApiController]

// Sets the base route for this controller to /sales.
[Route("sales")]

 // Requires the user to be authenticated before accessing any sales endpoint.
[Authorize]

public class SalesController : ControllerBase
{
    // Service used to read and save sales data.
    private readonly SalesService _salesService;

    // Inject the sales service through the controller constructor.
    public SalesController(SalesService salesService)
    {
        _salesService = salesService;
    }
    
    // User is an object that ASP.NET Core automatically creates after successfully authenticating a request.
    // It represents the currently logged-in user.
    
    [HttpGet]
    public ActionResult<List<Sale>> GetAllSales()
    {
        string? role = User.FindFirst(ClaimTypes.Role)?.Value;
        string? fullName = User.FindFirst("FullName")?.Value;

        if (role == "Administrator")
        {
            return Ok(_salesService.GetAll());
        }

        return Ok(_salesService.GetByAgent(fullName!));
    }

    [HttpGet("{id}")]
    public ActionResult<Sale> GetSaleById(int id)
    {
        var sale = _salesService.GetById(id);

        // If no sale exists with the requested ID, return 404 Not Found.
        if (sale == null)
        {
            return NotFound(new { message = $"Sale with ID {id} not found." });
        }

        // Return the sale with a 200 OK response.
        return Ok(sale);
    }

    [HttpPost]
    public ActionResult AddSale(Sale sale)
    {
        try
        {
            // Read the authenticated user's full name from the JWT claims.
            string? fullName = User.FindFirst("FullName")?.Value;

            // Store the authenticated user's name as the agent for this sale.
            sale.Agent = fullName;

            // Save the sale using the sales service.
            _salesService.AddSale(sale);

            // Return 201 Created and include a route to retrieve the new sale.
            return CreatedAtAction(
                nameof(GetSaleById),
                new { id = sale.TicketId },
                
                sale);
        }
        catch (Exception ex)
        {
            // Return 400 Bad Request if the sale could not be saved.
            return BadRequest(ex.Message);
        }
    }
    
}