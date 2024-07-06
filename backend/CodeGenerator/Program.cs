
using NJsonSchema.CodeGeneration.TypeScript;
using NSwag.CodeGeneration.OperationNameGenerators;
using NSwag;
using NSwag.CodeGeneration.TypeScript;

public static class Program
{
    public static void Main()
    {
        var document = OpenApiDocument.FromUrlAsync("https://localhost:7041/swagger/v1/swagger.json").Result;

        GenerateTypescript(document);
    }

    private static void GenerateTypescript(OpenApiDocument document)
    {
        var generatorSettings = new TypeScriptClientGeneratorSettings
        {
            GenerateOptionalParameters = true,
            OperationNameGenerator = new TagNameGenerator(),
            UseAbortSignal = true,
        };

        generatorSettings.TypeScriptGeneratorSettings.TypeStyle = TypeScriptTypeStyle.Interface;
        generatorSettings.TypeScriptGeneratorSettings.EnumStyle = TypeScriptEnumStyle.StringLiteral;
        generatorSettings.TypeScriptGeneratorSettings.DateTimeType = TypeScriptDateTimeType.String;

        var code = new TypeScriptClientGenerator(document, generatorSettings).GenerateFile();

        File.WriteAllText(@"..\..\frontend\src\api\generated.ts", code);
    }
}

public sealed class TagNameGenerator : MultipleClientsFromOperationIdOperationNameGenerator
{
    public override string GetClientName(OpenApiDocument document, string path, string httpMethod, OpenApiOperation operation)
    {
        if (operation.Tags?.Count == 1)
        {
            return operation.Tags[0];
        }

        return base.GetClientName(document, path, httpMethod, operation);
    }
}