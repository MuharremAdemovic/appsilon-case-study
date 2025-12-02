# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Appsilon.Api.csproj", "./"]
RUN dotnet restore "Appsilon.Api.csproj"
COPY . .
RUN dotnet publish "Appsilon.Api.csproj" -c Release -o /app/publish

# Serve Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Appsilon.Api.dll"]
