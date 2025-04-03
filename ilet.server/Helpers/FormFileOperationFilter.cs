namespace ilet.Server.Helpers
{
    using Microsoft.OpenApi.Models;
    using Swashbuckle.AspNetCore.SwaggerGen;
    using System.Linq;
    using Microsoft.AspNetCore.Mvc.ApiExplorer;

    public class FormFileOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var apiDescription = context.ApiDescription;

            var formParams = apiDescription.ParameterDescriptions
                .Where(p => p.Type == typeof(IFormFile));

            if (!formParams.Any()) return;

            operation.RequestBody = new OpenApiRequestBody
            {
                Content = {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = {
                            ["profilePicture"] = new OpenApiSchema
                            {
                                Type = "string",
                                Format = "binary"
                            }
                        },
                        Required = new HashSet<string> { "profilePicture" }
                    }
                }
            }
            };

            operation.Parameters.Clear(); // <-- Swagger'ın hatalı parametre üretmesini engeller
        }
    }


}
