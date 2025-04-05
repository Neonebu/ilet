namespace ilet.Server.Helpers
{
    using Microsoft.OpenApi.Models;
    using Microsoft.OpenApi.Readers;
    using Swashbuckle.AspNetCore.SwaggerGen;
    using System.Reflection;

    public static class SwaggerGenOptionsExtensions
    {
        public static void IncludeExternalSwaggerDoc(this SwaggerGenOptions options, string filePath)
        {
            var openApiDoc = new OpenApiStreamReader()
                .Read(File.OpenRead(filePath), out var diagnostic);

            options.DocumentFilter<ExternalSwaggerDocumentFilter>(openApiDoc);
        }

        private class ExternalSwaggerDocumentFilter : IDocumentFilter
        {
            private readonly OpenApiDocument _externalDoc;

            public ExternalSwaggerDocumentFilter(OpenApiDocument externalDoc)
            {
                _externalDoc = externalDoc;
            }

            public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
            {
                foreach (var path in _externalDoc.Paths)
                {
                    swaggerDoc.Paths[path.Key] = path.Value;
                }
            }
        }
    }

}
