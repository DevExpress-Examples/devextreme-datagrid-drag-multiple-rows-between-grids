using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using ASP.NET_Core.Models;
using ASP_NET_Core.Models;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace ASP.NET_Core.Controllers
{
    [Route("api/[controller]/[action]")]
    public class DnDBetweenGridsController : Controller
    {
        InMemoryRowReorderingTasksDataContext _context;

        public DnDBetweenGridsController(IHttpContextAccessor httpContextAccessor, IMemoryCache memoryCache)
        {
            _context = new InMemoryRowReorderingTasksDataContext(httpContextAccessor, memoryCache);
        }

        [HttpGet]
        public object Tasks(DataSourceLoadOptions loadOptions)
        {
            return DataSourceLoader.Load(_context.Tasks.Where(task => task.Status < 3).Take(10).ToList<RowReorderingTask>(), loadOptions);
        }

        [HttpPut]
        public IActionResult UpdateTask(int key, string values)
        {
            var order = _context.Tasks.First(o => o.ID == key);

            var updates = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(values);
            foreach (var property in updates)
            {
                switch (property.Key)
                {
                    case "Subject":
                        order.Subject = property.Value.GetString();
                        break;
                    case "Status":
                        order.Status = property.Value.GetInt32();
                        break;
                    case "Owner":
                        order.Owner = property.Value.GetInt32();
                        break;
                    case "AssignedEmployee":
                        order.AssignedEmployee = property.Value.GetInt32();
                        break;
                    case "Priority":
                        order.Priority = property.Value.GetInt32();
                        break;
                    case "OrderIndex":
                        order.OrderIndex = property.Value.GetInt32();
                        break;
                }
            }

            if (!TryValidateModel(order))
                return BadRequest(ModelState.GetFullErrorMessage());

            _context.SaveChanges();

            return Ok(order);
        }
    }
}
