## 1. 📌 Overview
Aplicación web para gestionar un torneo de pádel de un solo día con:
*   **Capacidad:** 2 canchas disponibles.
*   **Formato híbrido:** Fase de grupos + eliminación directa.
*   **Diseño:** Operación vía HTTP, actualización automática y maximización del uso de canchas sin tiempos muertos.

---

## 2. 🎯 Objetivos

### Objetivo principal
Permitir organizar y ejecutar un torneo de forma eficiente, asegurando:
*   Fluidez operativa.
*   Actualización automática del cuadro.
*   Transparencia para jugadores.

### Objetivos secundarios
*   Reducir carga manual del organizador.
*   Mantener canchas siempre ocupadas.
*   Generar engagement previo al evento.

---

## 3. 👥 Usuarios

*   **Admin (organizador):** Carga participantes, configura torneo, reconfirma asistencia (check-in) y carga resultados.
*   **Público / Jugadores:** Visualizan cuadros, ven partidos actuales/próximos y siguen el progreso en tiempo real.

---

## 4. 📅 Flujo del torneo

### Pre-evento (hasta 3 semanas antes)
*   Publicación del torneo e inscripción vía WhatsApp.
*   Recolección de datos: Nombres y Categorías.

### Día del evento
1.  **Check-in:** Reconfirmación manual de parejas y activación.
2.  **Generación del torneo:** Armado de grupos, ranking de parejas y aplicación de configuración.
3.  **Ejecución en vivo:** Sugerencia de partidos, carga de resultados y actualización automática.
4.  **Finalización:** Determinación de ganador y visualización pública final.

---

## 5. ⚙️ Reglas del torneo

*   **Participantes:** Entre 8 y 18 parejas.
*   **Formato:** Fase de grupos + eliminación directa.
*   **Partidos:** 1 set por partido (A 4 games o A 6 games con tiebreak).
*   **Grupos:** Configurables de 3 o 4 parejas.

---

## 6. 🧠 Lógica del sistema (Core)

### 6.1 Ranking de parejas
> `Nivel pareja = (nivel jugador A + nivel jugador B) / 2`  
Se usa para balancear grupos y ordenar los "seeds".

### 6.2 Generación de grupos y cuadro
*   **Inputs:** Participantes reconfirmados y configuración del torneo.
*   **Outputs:** Grupos balanceados por nivel y cuadro de eliminación.

### 6.3 Scheduling inteligente (KEY FEATURE) 🌟
*   **Objetivo:** Mantener SIEMPRE las 2 canchas ocupadas.
*   **Priorización:** Partidos sin dependencias, que desbloquean otros o de fases más atrasadas.

### 6.4 Actualización vía HTTP
Cada resultado enviado gatilla la actualización de la tabla de grupos, define clasificados, desbloquea partidos y recalcula prioridades.

---

## 7. 🧩 Edge Case — Mejores no clasificados

**Problema:** Necesidad de completar el cuadro con parejas eliminadas (Lucky Losers).  
**Métrica:** `Score = Games Ganados - Games Perdidos`.

*   **Desempates:** Partidos ganados > Head-to-head > Sorteo.
*   **Uso:** Completar bracket (ej: llevar a 8 o 16 clasificados).

---

## 8. 🖥️ Funcionalidades

### 8.1 Admin
*   **Participantes:** Alta/Edición y Check-in (reconfirmación).
*   **Configuración:** Sets por fase, tamaño de grupos y formato.
*   **Operación:** Carga de resultados, vista de sugerencias y estado en vivo.

### 8.2 Público (web abierta)
*   **Visualización:** Grupos, cuadro de eliminación y estado en vivo.
*   **Engagement:** Link a WhatsApp e información del torneo/premios.

---

## 9. 🎨 UI/UX

1.  **Landing:** Info del torneo y CTA a WhatsApp.
2.  **Vista en vivo:** Cancha 1 y 2 con partido actual + próximos sugeridos ("Prepárense").
3.  **Cuadro:** Grupos y eliminación con actualización en vivo.
4.  **Admin Panel:** Vista simplificada para check-in rápido y carga de resultados.

---

## 10. 🧪 Edge Cases adicionales
*   Jugadores no se presentan o abandonos por lesión.
*   Número impar de parejas o empates complejos en grupos.
*   Reconfiguración manual por parte del admin.

---

## 11. 🔔 Engagement
*   **Pre-torneo:** Comunicación anticipada e inscripción visual.
*   **Durante:** Pantalla pública visible con experiencia en vivo.
*   **Post:** Destaque de ganadores.

---

## 12. 🏗️ Consideraciones técnicas

*   **Backend:** Endpoints públicos y "privados" (con seguridad mínima mitigada).
*   **Frontend:** React Query para mantener el estado actualizado vía HTTP sin sockets.
*   **Escalabilidad:** Optimizado para 12-18 parejas con grupos automáticos y cuadro simple.
