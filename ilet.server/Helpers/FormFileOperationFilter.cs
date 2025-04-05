using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ilet.server.Helpers
{
    public class FormFileOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var fileParams = context.ApiDescription.ParameterDescriptions
                .Where(p => p.Type == typeof(IFormFile) || p.Type == typeof(IFormFileCollection));

            if (!fileParams.Any())
                return;

            operation.RequestBody = new OpenApiRequestBody
            {
                Content =
                {
                    ["multipart/form-data"] = new OpenApiMediaType
                    {
                        Schema = new OpenApiSchema
                        {
                            Type = "object",
                            Properties = fileParams.ToDictionary(p => p.Name, p => new OpenApiSchema
                            {
                                Type = "string",
                                Format = "binary"
                            }),
                            Required = new HashSet<string>(fileParams.Select(p => p.Name))
                        }
                    }
                }
            };
        }
    }
}
