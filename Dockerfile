# Start with a Node image
FROM node:20-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory
WORKDIR /app

# Copy package files and install Node dependencies
COPY package.json ./
# Notice: not explicitly copying package-lock.json here just in case it doesn't exist, though it usually does.
RUN npm install --production

# Copy Python requirements and install them
COPY requirements.txt ./
RUN pip3 install -r requirements.txt --break-system-packages

# Copy the rest of the application code
COPY . .

# Expose the Render assigned port
EXPOSE $PORT

# Make the start script executable and run it
RUN chmod +x render-start.sh
CMD ["./render-start.sh"]
