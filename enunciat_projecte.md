Projecte: Plataforma de Venda d’Entrades per a un Esdeveniment d’Alta Demanda (Temps Real)
1. Context i objectiu del projecte
En aquest projecte no esteu fent una web “clàssica” de compra d’entrades. Esteu construint una aplicació que ha de funcionar quan molts usuaris entren alhora, competeixen pels mateixos seients i esperen respostes immediates i coherents del sistema.
L’objectiu principal és que implementeu funcionalitats de temps real utilitzant Socket.IO, i que entengueu problemes reals com:
concurrència,
bloqueig temporal de recursos,
sincronització d’estat entre molts clients,
gestió de conflictes.
El projecte simula la venda d’entrades d’un esdeveniment molt popular (concert, final esportiva, conferència internacional, etc.).
2. Descripció general del sistema
L’aplicació permetrà:
Visualitzar un esdeveniment amb un plànol de seients.
Reservar seients temporalment mentre dura el procés de compra.
Veure en temps real com altres usuaris reserven o compren entrades.
Finalitzar la compra o perdre la reserva si s’esgota el temps.
Consultar entrades comprades.
Gestionar l’esdeveniment des d’un panell d’administració amb dades en temps real.
El servidor és sempre l’única font de veritat. El client mai decideix l’estat d’un seient.
3. Funcionalitats
3.1 Part usuari
3.1.1 Vista de l’esdeveniment
Informació general:
nom de l’esdeveniment
data i hora
recinte
descripció
preus per tipus d’entrada
3.1.2 Mapa de seients en temps real
Cada seient ha de tenir un estat clar i visible:
Disponible: lliure.
Reservat: bloquejat temporalment per un altre usuari.
Seleccionat per mi: reservat per l’usuari actual.
Venut: compra finalitzada.
Els canvis d’estat han de reflectir-se instantàniament a tots els navegadors connectats.
3.1.3 Reserva temporal de seients
L’usuari pot seleccionar fins a N seients (definit al sistema).
En seleccionar un seient:
s’envia una petició al servidor via Socket.IO.
el servidor decideix si la reserva és possible.
Si la reserva s’accepta:
el seient queda reservat temporalment.
s’inicia un temporitzador visible (per exemple, 3–5 minuts).
Si la reserva expira o l’usuari abandona:
el seient torna a estar disponible automàticament.
3.1.4 Procés de compra
Introducció de dades personals.
Confirmació de compra.
En confirmar:
el servidor valida que l’usuari és el propietari de la reserva.
els seients passen a estat venut.
tots els clients reben l’actualització en temps real.
3.1.5 Consulta d’entrades
Consulta d’entrades comprades mitjançant correu electrònic o compte d’usuari.
Visualització del detall de l’esdeveniment i seients adquirits.
3.2 Part administrativa
3.2.1 Gestió de l’esdeveniment
Crear i editar esdeveniments.
Definir:
aforament
plànol de seients o zones
categories i preus
3.2.2 Panell en temps real
L’administrador ha de veure:
seients disponibles / reservats / venuts en temps real
nombre d’usuaris connectats
nombre de reserves actives
compres confirmades
3.2.3 Informes
Recaptació per tipus d’entrada.
Recaptació total.
Percentatge d’ocupació.
Evolució temporal de vendes i reserves.
4. Temps real (obligatori)
4.1 Ús de Socket.IO
Socket.IO no és una ampliació, és part del nucli del projecte.
Heu d’implementar, com a mínim:
sincronització d’estat en entrar a l’esdeveniment
reserva i alliberament de seients
notificació de compra
gestió de múltiples usuaris simultanis
4.2 Regles clares
El client no pot forçar cap estat.
El servidor valida:
disponibilitat
propietat de la reserva
expiració del temps
Dos usuaris no poden comprar mai el mateix seient.
4.3 Gestió de concurrència
Heu de demostrar que:
dos usuaris poden intentar reservar el mateix seient
només un ho aconsegueix
l’altre rep una resposta clara i immediata
Això s’ha de resoldre al servidor, no amb trucs de frontend.
5. Requisits tècnics
5.1 Backend
Backend principal amb PHP/Laravel o Node.js.
Servei de temps real amb Node.js + Socket.IO (recomanat).
Validació de dades al servidor.
Gestió d’expiració de reserves.
Base de dades compartida i consistent.
5.2 Frontend
Vue + Nuxt amb components.
Gestió d’estat reactiva.
Interfície clara per:
estat dels seients
temporitzador de reserva
errors de concurrència
5.3 Seguretat i robustesa
Validació client + servidor.
Limitació de reserves per usuari.
Gestió de reconexió (si un usuari recarrega la pàgina).
Protecció bàsica contra abús (spam de reserves).
6. Lliurables
Repositori Git amb el projecte complet.
Publicació a l’entorn indicat.
Script SQL de creació i dades inicials.
Manual d’instal·lació i configuració.
Diagrames:
casos d’ús
seqüència del procés de reserva i compra (amb Socket.IO)
entitat-relació
Tests:
Cypress (flux normal i errors)
test de concurrència (obligatori)
7. Ampliació opcional: WebRTC
7.1 Assistència en directe (1 a 1)
Implementació d’un sistema d’assistència en directe entre usuari i administrador mitjançant WebRTC:
Àudio i vídeo punt a punt.
Socket.IO utilitzat com a signaling server.
Cas d’ús real: ajuda durant el procés de compra.
No es demana:
streaming massiu
múltiples participants
gravació de vídeo
L’objectiu és entendre com es combina WebRTC amb un sistema en temps real existent.
8. Criteris d’avaluació
Funcionament correcte en concurrència.
Coherència de l’estat dels seients.
Ús real i justificat de Socket.IO.
Qualitat del codi i estructura.
Experiència d’usuari en situacions de conflicte.
(Opcional) Implementació funcional de WebRTC.
9. Observacions finals
Tot el projecte s’ha de fer en català.
L’exposició també serà en català.
El codi ha d’estar ordenat, comentat i justificat.
No es poden utilitzar CDN externs.

CLIENT (FRONTEND)
Mòdul Client — Especificacions del Projecte
Desenvolupareu una aplicació web utilitzant Vue 3 amb Composition API i el framework Nuxt. Aquest projecte integra els continguts del mòdul de frontend amb un escenari real de concurrència i temps real, on la gestió d’estat i la reactivitat són crítiques.
L’aplicació ha de ser capaç de:
representar un sistema de venda d’entrades en temps real,
reaccionar a canvis provinents del servidor,
mantenir un estat coherent encara que hi hagi molts usuaris connectats simultàniament.
1. Requeriments tècnics
1.1 Arquitectura i components
Implementació amb Vue 3 (Composition API) i Nuxt.
Estructuració clara del projecte:
pages/
components/
composables/
stores/
plugins/
Creació de components reutilitzables, com a mínim:
mapa de seients
seient individual
temporitzador de reserva
llegenda d’estats
notificacions d’error i estat
Implementació de rutes:
portada (llistat d’esdeveniments)
pàgina d’esdeveniment (ruta dinàmica)
checkout
consulta d’entrades
panell d’administració
Integració d’una llibreria de components UI (a escollir), adaptant-la al disseny del projecte.
2. Gestió d’estat (obligatori)
2.1 Pinia
Ús obligatori de Pinia com a gestor d’estat global.
Pinia ha de centralitzar:
estat dels seients (disponible / reservat / seleccionat / venut)
reserves actives de l’usuari
temporitzador de reserva
informació de l’esdeveniment
estat de connexió Socket.IO
No està permès gestionar l’estat de seients només amb props o emit.
2.2 Flux d’estat en temps real
En entrar a la pàgina d’un esdeveniment:
el frontend sol·licita l’estat inicial al servidor
aquest estat s’emmagatzema a Pinia
Les actualitzacions rebudes via Socket.IO:
modifiquen Pinia
es reflecteixen automàticament a la UI
3. Temps real amb Socket.IO (obligatori)
3.1 Integració al frontend
Integració de Socket.IO client mitjançant un plugin de Nuxt.
triggering d’esdeveniments des de components (ex: reserva de seient).
recepció d’esdeveniments globals que actualitzen Pinia.
3.2 Comportament esperat
Els seients han de canviar d’estat en temps real quan:
un altre usuari els reserva
una reserva expira
una compra es completa
La UI ha de reaccionar sense refrescar la pàgina.
Els conflictes (seient ja reservat/venut) han de mostrar-se clarament a l’usuari.
4. Renderització
4.1 Server Side Rendering (SSR)
SSR obligatori a la pàgina principal (portada):
llistat d’esdeveniments
informació general
4.2 Renderització estàtica / client-side
La resta de pàgines poden ser:
renderitzades estàticament o
client-side
La pàgina de l’esdeveniment ha d’estar preparada per actualitzacions contínues de dades en temps real.
5. Testing (obligatori)
S’han d’implementar com a mínim els següents tests. Lo idel es que sigueu capaços d'integrar aquesta part amb CI/CD, que es passin els tests abans de fer deploy. 
5.1 Tests unitaris
Funcions de:
gestió d’estat
transformació de dades rebudes del servidor
càlcul del temps restant de reserva
5.2 Tests de rutes
Comprovació de:
rutes dinàmiques
paràmetres d’URL
redireccions bàsiques
5.3 Tests de Pinia
Inicialització correcta de l’estat.
Actualització d’estat davant:
events Socket.IO simulats
accions de l’usuari.
Reset d’estat en sortir de l’esdeveniment.
6. Qualitat del codi
El codi ha de ser:
llegible
modular
fàcil de mantenir
Ús recomanat (no obligatori, però valorable):
Prettier per formatació
ESLint per consistència i detecció d’errors
Separació clara entre:
lògica de negoci
presentació
comunicació amb el servidor
7. Funcionalitats opcionals (per pujar nota)
7.1 Visualització de dades
Integració de gràfics amb Vue ChartJS:
ocupació de l’esdeveniment
evolució de vendes
Dades obtingudes des de Pinia (actualitzades en temps real).
7.2 Millores d’experiència d’usuari
Animacions en canvis d’estat de seients.
Indicadors de càrrega i connexió.
Gestió de reconexió Socket.IO amb recuperació d’estat.
8. Avaluació
Es valorarà especialment:
ús correcte de Vue + Nuxt amb Composition API,
gestió adequada de l’estat global amb Pinia,
integració real (no superficial) de Socket.IO,
capacitat de la UI de reaccionar a escenaris de concurrència,
qualitat i estructura del codi.
9. Entrega
L’aplicació ha de ser completament funcional.
Ha de complir tots els requisits obligatoris.
El codi ha d’estar documentat i estructurat.
Qualsevol decisió arquitectònica rellevant ha d’estar justificada breument.
Nota final (important)
Si el vostre frontend no reflecteix correctament els canvis en temps real, encara que el backend funcioni, el projecte no compleix l’objectiu del mòdul. Aquí no s’avalua només Vue, s’avalua si enteneu com es construeix una aplicació reactiva en un entorn real.

Backend (PHP)
Backend principal amb PHP/Laravel o Node.js.
Servei de temps real amb Node.js + Socket.IO (recomanat).
Validació de dades al servidor.
Gestió d’expiració de reserves.
Base de dades compartida i consistent. 
Opcional
Enviar un correu a l’usuari amb la confirmació de la comanda

IA x Desenvolupar
Us d’IA amb desenvolupament guiat per especificació (OpenSpec)
Es demana treballar una funcionalitat concreta de l’aplicació utilitzant una metodologia de Spec-Driven Development (SDD) amb suport d’Intel·ligència Artificial.
L’objectiu no és només obtenir un resultat funcional, sinó demostrar la capacitat de definir, guiar i controlar un agent d’IA a partir d’una especificació formal.
📦 Tasques a realitzar
1. Definició de la funcionalitat
Escollir una feature concreta i acotada (comenteu-la abans amb mi).
Crear una especificació amb OpenSpec (fent els opsx:propose) :
foundations.md → context, objectius i restriccions
spec.md → comportament esperat
plan.md → estratègia d’implementació
2. Implementació amb IA
Utilitzar un agent d’IA per generar la funcionalitat (opsx:apply).
No es tracta de “provar prompts fins que funcioni”, sinó de:
Partir de la especificació
Iterar de forma controlada
Corregir desviacions respecte al spec
3. Traçabilitat obligatòria (CRÍTIC)
Cal demostrar tot el procés. Sense això, la pràctica es considera incompleta.
S’haurà d’entregar:
Prompts utilitzats per generar la especificació
Prompts utilitzats durant la implementació
Prompts de correcció / refinament
Evidència de:
Errors detectats
Com s’han corregit
Relació entre problema i canvi en el prompt
👉 Això ha d’estar organitzat en un fitxer tipus:
/docs/prompts-log.md  amb estructura cronològica clara.
4. Anàlisi del resultat
Reflexió obligatòria amb les vostres paraules sobre:
L’agent ha seguit realment la especificació?
Quantes iteracions han estat necessàries?
On falla més la IA (interpretació, execució, coherència)?
Has hagut de modificar la especificació o només els prompts?
📄 Entrega
1. Al repositori públic de GitHub
Ha d’incloure:
1. La carpeta specs/ (OpenSpec)
2 a la carpeta docs/ amb:
prompts-log.md (traçabilitat completa)
PDF (veure més avall)
2. Document PDF
Ha d’incloure:
Explicació de la funcionalitat
Procés seguit amb la IA
Principals problemes trobats
Decisions preses (canvis en prompts o spec)
Valoració crítica real (no superficial)
⚠️ Nota important
Si no hi ha traçabilitat clara dels prompts i iteracions, no es podrà avaluar l’ús real de la IA, i la pràctica es considerarà incompleta encara que el resultat funcioni.