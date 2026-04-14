# Concurrència i Control d'Estats

## Flux d'alliberament

FlowPass és una aplicació sensible en matèria de concurrència. Utilitza Sockets i Webhooks en Node.js de fons. Si diverses peticions arriben milisegons separades per accedir al mateix seient (El clàssic cas de col·lisió de reserves):
1. El servidor Node.js té `event.model` actuant com un `Map()` estructurat a memòria, que gestiona crides sincrònicament respecte d'una propietat objecte (cada JavaScript thread event-loop opera sobre la mateixa memòria serialitzada de forma natural). 
2. La sol·licitud que arriba primer farà "Early Return" quan la següent intenti passar la línia de validació:
```javascript
  if (seat.status !== SEAT_STATUS.AVAILABLE) {
    return { success: false, error: `Seat ${id} is already ${seat.status}` };
  }
```
3. Ningú podrà escamotejar l'estat donat que, quan entra una confirmació `emit()`, s'activa el panell sencer amb la reincorporació als esdeveniments per sala i socket individual.

## Sweeper Timeout (El netejador Automàtic)
Cada cert temps (definit al costat servidor com cada **30 segons** o 1 minut), es fa un tir o `setInterval` que escombra la memòria detectant a l'interval les referències temporals que estan desfasades (`expiresAt < new Date()`). Açò assegura que mai hi hagui cap seient congelat. Les referències que es modifiquen s'envien com avalotades a l'escenari (esdeveniment / sala particular).
