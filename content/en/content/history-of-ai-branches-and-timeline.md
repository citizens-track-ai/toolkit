---
title: 'History of AI: Branches and Timeline'
draft: false
collections:
  - history-of-ai
facilitator_overview: |-
  This presentation presents a rough chronological history of AI development, highlighting different **branches** of artificial intelligence. 
   
  * You can present the slides as a short 'lecture'
  * You can use these slides as a recap of key points after using the 'Hands on Histories' activity
  * You can use the cards view to create a group activity (e.g. arrange the cards in order, and identify examples of each branch of AI that the group might be aware of)

  ### On analogies 

  This presentation makes use of a number of analogies to help participants develop an intuitive understanding of different kinds of AI.

  It can be useful to adapt these analogies for your audience and to find culturally relevant examples. 

  For example, when talking about 'Expert Systems' in England, I might mention the personality type flow-chart quizzes that teenage magazines often contain - and give the example of the [NHS 111 Service](https://en.wikipedia.org/wiki/NHS_111) (a telephone-based health triage service) as an expert system people may have experience of.

  It is important to note, and acknowledge in conversations, that all analogies are imperfect. Real world AI systems are often more complex than,  for example, a simple flow chart, and the might, in practice, combine different kinds of AI. 

  Generative AI tools can be helpful for finding local analogies and examples: but always check carefully by prompting for, and exploring sources about, the limitations of the analogies and examples you might choose. 

  ### The timeline

  The timeline of AI development could be presented in many different ways. 

  In this history, we have simplified by focussing not on when ideas were first introduced, but when they found wider applications that significantly impacted on society.

  This timeline also does not incorporate a discussion of 'AI Winters'.
elements:
  - type: information
    image: ''
    citation: ''
    text: |-
      # Science fictions

      Artificial intelligence is based on the idea that the process of human thought could be mechanized.  

      Chinese, Indian and Greek philosophers developed structured methods of formal reasoning by the first millennium BCE.

      In the 17th century, Leibniz, Thomas Hobbes and René Descartes explored the possibility that all rational thought could be made as systematic as algebra or geometry.
  - type: information
    image: ''
    citation: ''
    text: |-
      ## The Turing Test

      In the 1950's  computer scientist Alan Turing speculated about the possibility of creating machines that think. 

      His famous 'Turing test' replaces the question of **"can a machine think"** with the question **"can a machine imitate a human"**? 

      > In Alan Turing’s original 1950 "Imitation Game," a judge sits in a separate room and sends typed notes to two hidden players to guess which player is a man and which is a woman, while one player tries to trick the judge. 
      >
      > Turing asked: what if a computer takes the trickster's place? If the computer can pretend to be human so well that the judge gets fooled just as often as before, the machine passes Turing's test.
  - type: information
    image: ''
    citation: ''
    text: |-
      ## The Dartmouth Workshop

      1956: Reseachers gathered for the "Dartmouth Summer Research Project on Artificial Intelligence" in New Hampshire.

      They set out to explore if *"every aspect of learning or any other feature of intelligence can be so precisely described that a machine can be made to simulate it"*.

      The term 'Artificial Intelligence' was coined.

      The Dartmouth Workshop is often seen as the start of a 'discipline' of AI.
  - type: information
    image: ''
    citation: ''
    text: |-
      ## 1950s: General Problem Solvers: From Ends to Means

      Early AI systems were programmed with general rules to help them complete a range of tasks.

      For example, navigating a maze by trying a path, going back if you hit a dead end, and then trying the next path. 

      This can get much further than a computer program that just stops when if hits a dead end... but while these general rules work in small controlled settings, they can't navigate the complexity of many real world tasks.
  - type: information
    image: ''
    citation: https://findingeliza.org/overview.html - https://99percentinvisible.org/episode/the-eliza-effect/
    text: |-
      ### The first chat bot (1966)

      Some AI projects tried to find rules for handling 'natural language' (everyday talk). One such project, ELIZA, has been called the first chat bot. 

      It responded to typed messages by, for example, reflecting them back as questions: following a set of programmed rules for working with the structure of english sentences. 

      One version of the program behaved like a therapist. There were soon many people arguing that it could replace human therapists. 

      The creator of the ELIZA program (Joseph Weizenbaum) was concerned by this, and spent time trying to explain how the idea that it was intelligent was only an illusion.
  - type: information
    image: ''
    citation: ''
    text: |-
      ## 1970s: Expert Systems: Knowledge Representation & Decision Trees

      Researchers realised that rules alone were not enough. AI systems needed access to knowledge. 

      To create expert system, creators put together a large collections of facts and rules for making decisions on topics such as diagnosing illness, providing insurance, or giving agricultural advice. 

      The system follows uses this data to get from inputs to outputs, in ways that try and mirror the answers a human expert would give.
  - type: information
    image: ''
    citation: ''
    text: |-
      ### Deterministic systems

      Earlier AI systems were generally **deterministic** and **auditable**.

      If you gave the same input, you got the same output. And it was possible to inspect the rules that got from A to B.
  - type: information
    image: ''
    citation: ''
    text: |-
      ## 1990s: Probabalistic systems: Predictive Systems

      As use of computers and the Internet grew, more and more data was being collected.

      This data could be fed into new predictive algorithms that identified patterns in the data, and used these to make predictions about new situations. 

      This is the kind of AI that predicts the next song you might like to listen on a music player, or that decides what should appear next on a social media feed. 

      These predictive tools can also be used to organise supply chains, target advertisments, or decide what price to charge for travel tickets.
  - type: information
    image: ''
    citation: ''
    text: |-
      ## 2010s: Neural Networks: Computer Speech and Vision

      The design of neural network AI inspired by the way the human brain works. Layers of 'artificial neurons' are 'trained' by repeated exposure to specific data and to feedback on how well the network performed a given task. 

      In 1990 a neural network successfully recognised handwritten text. 

      In 2012 a neural network won the ImageNet competition (a competition to identify objects in images).

      Specialised neural network tools are used for many different appplications: from image and speech recognition, to making more advanced recommendations based on patterns in past data.
  - type: information
    image: ''
    citation: ''
    text: |-
      ## 2020s: Transformers: Generative AI

      Large Language Models are trained on vast amounts of data: hundreds of millions of words and pictures from scanned books, web pages, online forums, and other sources. 

      The transformer architecture, first described in 2017, in introduced the idea of 'attention': deciding which data deserves most attention at any particular point.

      Breakthroughts in the late 2010s led to 'general purpose' AI tools and Generative AI, which came to prominence with the public launch of ChatGPT in late 2022. 

      Generative AI tools can create text, images, audio and video in response to prompts.

      They use their training data to 'complete' the prompts, a bit like very advanced autocomplete.
  - type: information
    image: ''
    citation: ''
    text: |-
      ### General purpose systems

      Recent AI systems are sometimes called 'Frontier models' or 'Foundation models'. They can complete many different tasks that they were not explicitly programmed for. 

      This often comes at the cost of being able to easily explain how the inputs lead to outputs. 

      It has led some to argue they are 'artificial general intelligence' (AGI): capable of 'outperforming' humans on many different tasks.
  - type: information
    image: ''
    citation: ''
    text: |-
      ## 2025+: Reasoning Models & AI Agents

      Generative AI tools can be set up to operate in a cycle: where responses to one prompt are fed back into the tool, creating a 'reasoning' behaviour. 

      AI agents can take actions, such as searching the internet, or using other software tools, to complete more complex tasks.
  - type: takeaways
    image: ''
    citation: ''
    text: |-
      * There are many different technologies that have fallen under the label 'AI'
      * Generative AI has recieved the most attention in recent years: but other forms of AI are still around, and still raise questions for society
      * Many of the big questions that people are discussing today are not new: concerns about how to adapt to and make the most of AI, and how it will affect jobs, relationships, creativity and fairness have been around for decades
      * The development of AI has been shaped both by scientific breakthroughs and by the availability of data, computer power and funding
adaptation_guidance: ''
---
