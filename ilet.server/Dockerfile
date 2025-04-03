# Build aşaması
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ./ilet.server.csproj ./
COPY ./Properties ./Properties
RUN dotnet restore ilet.server.csproj

COPY . .
RUN dotnet publish ilet.server.csproj -c Release -o /app/publish

# Runtime aşaması
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .
COPY --from=build /src/Properties/uploadProfilePic.json ./Properties/uploadProfilePic.json

ENTRYPOINT ["dotnet", "ilet.server.dll"]
