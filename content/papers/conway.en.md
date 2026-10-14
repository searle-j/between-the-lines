---
title: Conway's Law
date: 2026-10-14
type: paper
publish: false
description: "Conway's law: how systems reflect their designers' communication structures, and why organizations should stay lean and flexible."
---
## Bibliographic Information

- title: How Do Committees Invent?
- author: Melvin E. Conway
- institution: Sperry Rand Corporation, UNIVAC Division
- venue / publisher: Datamation
- publication year: 1968
- link / code & data:
  - paper: https://www.melconway.com/Home/pdf/committees.pdf

---

## TL;DR

![Figure 1](../../assets/conway/figure-1.png)

- System design requires an organization with a design direction.
- But systems mirror the communication structures of the organizations that design them. A flawed organizational structure leads to a flawed system.
- Good system design requires simple communication structures and the flexibility to reorganize quickly when the current structure is not working.

---

## Summary

### The System Design Organization

- System design is the intellectual work of integrating diverse parts into a coherent whole. It is usually done with a client in mind: someone who wants to carry out an activity guided by the design, such as investigating a disaster and preventing its recurrence, or planning a new product.
- System design generally proceeds through three stages.
  1. Identify constraints and establish design principles, such as budget, schedule, staffing, and target performance.
  2. Set an initial direction: outline the design and organize the teams.
  3. Complete the design: make the teams' designs compatible and integrate them.
- By the time the teams are organized in the second stage, many decisions have already been made. *(Author's note. For example, splitting the organization into design and production teams assumes that design and production can be somewhat independent.)* The initial direction therefore biases the system design.
- Yet system design cannot proceed without a direction and design teams. Bias is unavoidable.

### The Designed System

- A designed system consists of smaller subsystems. Each is a complete system in its own right and can be divided into still smaller subsystems.
- For example, a public transportation system includes modes of transport such as buses, trains, and airplanes, as well as infrastructure such as parking lots, terminals, and ports. One level down, an airplane can be divided into structural, propulsion, power, communication, and payload systems.
- We can represent the whole system as a graph, with systems as nodes and communication paths between them as edges. These edges are increasingly called "interfaces," so let us use that term too. See Figure 1 in the TL;DR above.

### How the Organization Relates to the System

- We have represented the system as a graph. The design organization can be represented in the same way: committees are nodes, subcommittees are lower-level nodes, and coordinators are edges.
- The paper's central claim is that the system's graph resembles the graph of the organization that designed it. In other words, a system mirrors its designers' communication structure.
- The two structures resemble each other for two reasons.
  - **Nodes:** every subsystem has a group that designed it, so we can map nodes in one graph to nodes in the other. A single team may design several subsystems, so the mapping need not be one-to-one, but the broad structure is still preserved.
  - **Edges:** the groups responsible for two functionally connected subsystems must negotiate an interface. If two nodes are connected in the system graph, their counterparts must also be connected in the organization graph.

### Organizational Structure as a Bias

- Many designs can satisfy the same constraints. Rather than choosing the best possible design, an organization converges on one that most closely resembles its own communication structure. Designers find it easier to build a subsystem within their own team than to collaborate across teams.
- For example, hardware and software engineers often merely tolerate one another rather than collaborate effectively. Effective collaboration is rare and depends on an organizational structure that supports it.

### System Disintegration and Management

- Let us extend the argument to system disintegration: the subsystems fail to come together and instead become fragmented.
- This happens in three stages.
  1. Overstaffing: assign too many people to the design effort.
  2. Organizational disintegration: apply conventional management principles to a large design organization, breaking down its communication structure.
  3. System disintegration: the breakdown of the organization's communication structure is reflected in the system.
- A closer look at each stage:
  1. **Overstaffing:** ideally, the person in charge takes enough time to understand the overall situation and build a lean design organization. But if the project fails, they fear criticism for taking too long without using all available resources. They therefore focus on committing as many resources as possible early on—asking everyone available to produce design documents—while neglecting efficient organization. Managers may also build the largest organization they can to expand their influence, regardless of efficiency. Once that organization exists, even if it was formed for the wrong reasons, its inefficiencies inevitably shape the system.
  2. **Organizational disintegration:** communication easily breaks down in an overstaffed organization. A major contributor is the conventional practice of measuring effort as headcount × time. It treats "5 people × 40 days" and "100 people × 2 days" as equivalent. But five people and a hundred people form different organizations and naturally design different systems. Some turn to a pyramidal hierarchy to solve this, but that only makes communication harder.
  3. **System disintegration:** once things have deteriorated this far, it is no surprise that the system falls apart.

### Conclusion

- Organizational structure is reflected in system design.
- Unnecessary organizational complexity leads to unnecessary system complexity.
- If the organization is hurting the system design, change the organization.
- Those responsible for the organization should therefore be encouraged to keep it both lean and flexible.

---

## Reflections

- Anyone who has worked in an organization will probably find plenty here that rings true. Some things have barely changed since the 1960s...
- Could AI agents make it easier to keep organizational structures flexible? Organizations with a higher ratio of AI agents to people might be more flexible, since agents are easier to reassign.
- There are some loose ends, and the writing is not particularly good. Still, the flashes of insight made it a fun read.

---

## Takeaways

- Conway's paper laid the groundwork for research on socio-technical congruence—the alignment of social and technical structures.

---

## Next reading

- **Empirical evidence for Conway's law:** [The Mirroring Hypothesis](mirroring-hypothesis.en.md)
- **Organizational changes following AI adoption:** [The Cybernetic Teammate](cybernetic-teammate.en.md)
- **Extending the idea to human–agent organizations:** [Adapting Socio-Technical Congruence to Human-Agent Collectives](adapting-socio-technical-congruence.en.md)

---

#software #organization #communication
