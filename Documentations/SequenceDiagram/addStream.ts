sequenceDiagram
participant Admin
participant Serveur
participant StreamManager
participant StreamFactory
participant Stream
participant Provider
participant Timeline

Admin->>Serveur: Se connecter
Admin->>Serveur: Naviguer sur /streams
Admin->>Serveur: Remplir les informations du stream (title, timeline, providers)
Admin->>Serveur: Sélectionner le provider primaire
Serveur->>Stream: Créer un nouveau stream avec les informations fournies
Serveur->>Provider: Associer les providers au stream
Serveur->>Timeline: Associer la timeline au stream
Serveur->>StreamManager: Ajouter le stream au StreamManager
StreamManager->>StreamFactory: Créer le provider de stream via StreamFactory
StreamFactory->>Stream: Retourner le provider de stream configuré
Stream->>StreamManager: Enregistrer le stream configuré dans le StreamManager
Serveur->>Admin: Confirmation de la création du stream
Admin->>Serveur: Démarrer le stream
Serveur->>StreamManager: Récupérer et démarrer le stream
StreamManager->>Stream: Appeler la méthode run pour démarrer le stream
Stream->>Provider: Initialiser et démarrer le stream avec le provider primaire
Stream->>Timeline: Démarrer la lecture de la timeline
Stream->>Admin: Notification du démarrage réussi du stream
