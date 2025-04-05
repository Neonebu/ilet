# Base .NET Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# SDK + Node.js (React Build için)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash && \
    apt-get install -y nodejs && \
    apt-get clean

WORKDIR /src

# .NET backend project restore
COPY ["ilet.server/ilet.server.csproj", "ilet.Server/"]
COPY ["ilet.sln", "./"]
RUN dotnet restore "./ilet.Server/ilet.Server.csproj"

# React Build
COPY ilet.client/ ilet.client/
WORKDIR /src/ilet.client
RUN npm install && npm run build

# Backend Build
WORKDIR /src
COPY . .
WORKDIR "/src/ilet.server"
RUN dotnet publish "./ilet.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Image
FROM base AS final
WORKDIR /app

COPY --from=build-env /app/publish .
ENTRYPOINT ["dotnet", "ilet.server.dll"]