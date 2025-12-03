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

# Install Python and dependencies
USER root
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv libgl1 libglib2.0-0

# Create virtual environment and install requirements
# We will mount requirements.txt at runtime or copy it here. 
# Better to copy it here to bake dependencies into the image.
# However, the ml folder is outside the build context of backend usually.
# So we will install packages globally or in a venv.
# Let's install ultralytics and opencv-python-headless directly.
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install ultralytics opencv-python-headless

EXPOSE 8080
ENTRYPOINT ["dotnet", "Appsilon.Api.dll"]
