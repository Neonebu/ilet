# .NET base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# .NET SDK + Node.js (React build için)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS with-node
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get -y install nodejs

# Build Stage (.NET + React)
FROM with-node AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# .NET Projesini restore et
COPY ["ilet.Server/ilet.Server.csproj", "ilet.Server/"]
RUN dotnet restore "./ilet.Server/ilet.Server.csproj"

# React Client'ı kopyala ve build et
COPY ilet.client/ ilet.client/
WORKDIR /src/ilet.client
RUN npm install
RUN npm run build

# Geri dön ve .NET Server'ı build et
WORKDIR /src
COPY . .
WORKDIR "/src/ilet.Server"
RUN dotnet build "./ilet.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish aşaması
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./ilet.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app

# React static dosyalarını publish içine kopyala
COPY --from=publish /app/publish .
COPY --from=build /src/ilet.client/dist ./wwwroot

ENTRYPOINT ["dotnet", "ilet.Server.dll"]
