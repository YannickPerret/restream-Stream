# Utiliser une image de base Ubuntu
FROM ubuntu:latest

# Installer les paquets nécessaires
RUN apt-get update && apt-get install -y \
    gstreamer1.0-tools \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    libwebkit2gtk-4.0-dev \
    xorg \
    xvfb \
    pulseaudio \
    wget \
    ca-certificates \
    && apt-get clean

# Ajouter un utilisateur non-root
RUN useradd -ms /bin/bash dockeruser
USER dockeruser

# Définir l'entrée du conteneur
ENTRYPOINT ["/bin/bash"]
