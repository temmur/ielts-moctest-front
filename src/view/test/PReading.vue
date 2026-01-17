<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import SentenceCompletion from '@/components/questions/SentenceCompletion.vue'
import MultipleChoice from '@/components/questions/MultipleChoice.vue'
import Matching from '@/components/questions/Matching.vue'
/* =========================
   TIMER
========================= */
const timeLeft = ref(120) // 2 minutes (testing)
let timer: number | null = null

const startTimer = () => {
  timer = window.setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    else finishReading()
  }, 1000)
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/* =========================
   DATA
========================= */
const currentPassageIndex = ref(0)
const answers = ref<Record<number, string>>({})

const router = useRouter()


const passages = ref([
  {
    passage: 1,
    title: 'The History of Libraries',
    text: ` In the 15th century, the Italian merchant Cyriacus of Ancona journeyed in search of the Mediterranean's classical past. In doing so, he laid the groundwork for today's cultural holidays.

Today we take it for granted that we travel around the world to admire the monuments of the past. We prepare for such trips by reading about what we are going to see, set out on the journey with a good idea of how we will get there and where we will stay and have a sense of what we will encounter on location. Cyriacus of Ancona (1391–1452), the first cultural tourist since antiquity, lacked these advantages when, in the first half of the 15th century, he sailed around the Mediterranean in search of the remains of Greek and Roman civilisations.

Cyriacus first became fascinated by ancient monuments while walking in his home city Ancona and looking at the marble arch, erected in AD 115, to the Roman Emperor Trajan. He suddenly saw the structure in a new light. He no longer saw it as just a familiar and generally overlooked landmark, but as a doorway to the wonders of ancient imperial Rome. Not many people of Cyriacus's time were interested in historical travel; they generally ignored old buildings and structures, or worse, dismantled them for their building materials.

Cyriacus decided to see the world for himself and to record details of whatever other antiquities remained to be discovered. His training as a merchant did not prepare him for this vocation; he did not know ancient languages, history or art. However, he set out to solve these failings, first by learning Latin at the age of 30 and then adding ancient Greek. Having done this, he then set off on voyages around the Mediterranean to find, investigate and understand ancient cultures from their buildings, sculptures and inscriptions. Thus he became the first archaeologist and cultural tourist, predating other antiquarians by some 200 years.

Travel in the 15th century, however, was anything but simple or enjoyable. Overland journeys by foot or mule along bad roads, under constant threat from bandits, were bad; voyages by sea were even worse. When the weather cooperated, sailing went relatively smoothly; ships proceeded along coasts from one recognizable landmark to another. However, when there was no wind the ship did not move. Strong winds were no friends either; they drenched the ship with lashing waves and blew it off course. Water swamped the deck, splashed into the cabins and soaked mattresses, clothes and food. Remarkably, Cyriacus never complained about the miseries of travel. Optimistic by nature, he endured such hardships unafraid and saw opportunities where other people saw setbacks.

Among many of the important records made by Cyriacus was his crucial documenting, in 1431, of the remains of Cyzicus, an ancient Roman city that had relied on commerce for its financial success. He hired a local person to take him to the site and then had to work out for himself the significance of the ruins he was looking at because there was no guidebook on ancient architecture to help him. Indeed, his contemporary knowledge about the ruins was limited. Cyzicus had been a splendid city in its prime. Unfortunately, the area was highly seismic and in AD 123 the city was so devastated by a major earthquake that, when the Roman Emperor Hadrian visited it the following year, he was so saddened that he decided to subsidise a campaign to reconstruct Cyzicus. He made a substantial donation for a new temple to the Roman god Jupiter. Cyriacus thought the ruined city was awe-inspiring. He found the remains of the temple and examined it in great detail, looking for clues in ancient texts to help him understand what he was seeing. He sketched the great doorway adorned with carved foliage and mythological characters. Cyriacus’s account of this temple is the only record of this building as in the following centuries it was entirely stripped of all its stonework and all that remains is its base.

Cyriacus also visited mainland Greece, in 1436, when no one went to Greece in order to see the country's ancient ruins. One of his destinations was the sanctuary of Delphi. The ancient Greeks considered Delphi as being situated in the most beautiful spot in Greece. When Cyriacus arrived at the site of Delphi, however, he found war, earthquakes and avalanches had all but obliterated its ruins. Determined to find any ancient traces, Cyriacus spent six days walking all over the area, peering at odd stone blocks sticking out of the ground, running his hands over inscriptions to trace fragments of words, and trying to puzzle out the few surviving structural remains. Climbing uphill towards the rocks that tower over the site, he came upon a theatre built into the slope. Soon after his visit, the site was buried by a rockslide and was not seen again until archaeologists began to excavate the area systematically in the late 19th century.

His travels also took him to the city of Alexandria in Egypt, where he was captivated by the towering Pharos lighthouse, one of the ancient wonders of the world, although by his time it was already in a state of severe disrepair. With his characteristic diligence, Cyriacus sought out local scholars and fishermen to gather stories about the lighthouse's original grandeur. He meticulously documented the massive stone blocks that had tumbled into the harbor and attempted to sketch its probable original form based on the descriptions he collected. This record, like that of the temple at Cyzicus, later proved invaluable as the structure eventually collapsed completely due to further earthquakes. Furthermore, during his time in Egypt, he ventured to the pyramids of Giza. He correctly identified them as the tombs of ancient pharaohs, a concept that was not widely understood by Europeans at the time. He measured their bases and marvelled at the engineering feat required to construct them, leaving behind some of the earliest Renaissance descriptions of these monumental structures.

Cyriacus had hoped to visit Ethiopia but he never got there. However, in his life he did record for posterity countless ancient monuments around the Mediterranean, paving the way for future archaeologists and cultural tourists.`,
    questions: [
      {
        id: 101,
        type: 'mcq',
        text: 'Where were the earliest libraries located?',
        options: ['Schools', 'Temples', 'Homes'],
        correct: 'Temples'
      },
      {
        id: 102,
        type: 'sentence',
        before: 'The earliest libraries stored',
        after: '.',
        correct: 'clay tablets and manuscripts'
      }
    ]
  },
  {
    passage: 2,
    title: 'Climate Change',
    text: `Travel in the 15th century, however, was anything but simple or enjoyable. Overland journeys by foot or mule along bad roads, under constant threat from bandits, were bad; voyages by sea were even worse. When the weather cooperated, sailing went relatively smoothly; ships proceeded along coasts from one recognizable landmark to another. However, when there was no wind the ship did not move. Strong winds were no friends either; they drenched the ship with lashing waves and blew it off course. Water swamped the deck, splashed into the cabins and soaked mattresses, clothes and food. Remarkably, Cyriacus never complained about the miseries of travel. Optimistic by nature, he endured such hardships unafraid and saw opportunities where other people saw setbacks.

Among many of the important records made by Cyriacus was his crucial documenting, in 1431, of the remains of Cyzicus, an ancient Roman city that had relied on commerce for its financial success. He hired a local person to take him to the site and then had to work out for himself the significance of the ruins he was looking at because there was no guidebook on ancient architecture to help him. Indeed, his contemporary knowledge about the ruins was limited. Cyzicus had been a splendid city in its prime. Unfortunately, the area was highly seismic and in AD 123 the city was so devastated by a major earthquake that, when the Roman Emperor Hadrian visited it the following year, he was so saddened that he decided to subsidise a campaign to reconstruct Cyzicus. He made a substantial donation for a new temple to the Roman god Jupiter. Cyriacus thought the ruined city was awe-inspiring. He found the remains of the temple and examined it in great detail, looking for clues in ancient texts to help him understand what he was seeing. He sketched the great doorway adorned with carved foliage and mythological characters. Cyriacus’s account of this temple is the only record of this building as in the following centuries it was entirely stripped of all its stonework and all that remains is its base.

Cyriacus also visited mainland Greece, in 1436, when no one went to Greece in order to see the country's ancient ruins. One of his destinations was the sanctuary of Delphi. The ancient Greeks considered Delphi as being situated in the most beautiful spot in Greece. When Cyriacus arrived at the site of Delphi, however, he found war, earthquakes and avalanches had all but obliterated its ruins. Determined to find any ancient traces, Cyriacus spent six days walking all over the area, peering at odd stone blocks sticking out of the ground, running his hands over inscriptions to trace fragments of words, and trying to puzzle out the few surviving structural remains. Climbing uphill towards the rocks that tower over the site, he came upon a theatre built into the slope. Soon after his visit, the site was buried by a rockslide and was not seen again until archaeologists began to excavate the area systematically in the late 19th century.

His travels also took him to the city of Alexandria in Egypt, where he was captivated by the towering Pharos lighthouse, one of the ancient wonders of the world, although by his time it was already in a state of severe disrepair. With his characteristic diligence, Cyriacus sought out local scholars and fishermen to gather stories about the lighthouse's original grandeur. He meticulously documented the massive stone blocks that had tumbled into the harbor and attempted to sketch its probable original form based on the descriptions he collected. This record, like that of the temple at Cyzicus, later proved invaluable as the structure eventually collapsed completely due to further earthquakes. Furthermore, during his time in Egypt, he ventured to the pyramids of Giza. He correctly identified them as the tombs of ancient pharaohs, a concept that was not widely understood by Europeans at the time. He measured their bases and marvelled at the engineering feat required to construct them, leaving behind some of the earliest Renaissance descriptions of these monumental structures.

Cyriacus had hoped to visit Ethiopia but he never got there. However, in his life he did record for posterity countless ancient monuments around the Mediterranean, paving the way for future archaeologists and cultural tourists.\`,
    `,
    questions: [
      {
        id: 201,
        type: 'mcq',
        text: 'What causes climate change?',
        options: ['Natural only', 'Human only', 'Both'],
        correct: 'Both'
      },
      {
        id: 202,
        type: 'sentence',
        before: 'Climate change refers to long-term changes in',
        after: '.',
        correct: 'temperature and weather patterns'
      }
    ]
  },
  {
    passage: 3,
    title:'Nature',
    text:'Travel in the 15th century, however, was anything but simple or enjoyable. Overland journeys by foot or mule along bad roads, under constant threat from bandits, were bad; voyages by sea were even worse. When the weather cooperated, sailing went relatively smoothly; ships proceeded along coasts from one recognizable landmark to another. However, when there was no wind the ship did not move. Strong winds were no friends either; they drenched the ship with lashing waves and blew it off course. Water swamped the deck, splashed into the cabins and soaked mattresses, clothes and food. Remarkably, Cyriacus never complained about the miseries of travel. Optimistic by nature, he endured such hardships unafraid and saw opportunities where other people saw setbacks.\n' +
        '\n' +
        'Among many of the important records made by Cyriacus was his crucial documenting, in 1431, of the remains of Cyzicus, an ancient Roman city that had relied on commerce for its financial success. He hired a local person to take him to the site and then had to work out for himself the significance of the ruins he was looking at because there was no guidebook on ancient architecture to help him. Indeed, his contemporary knowledge about the ruins was limited. Cyzicus had been a splendid city in its prime. Unfortunately, the area was highly seismic and in AD 123 the city was so devastated by a major earthquake that, when the Roman Emperor Hadrian visited it the following year, he was so saddened that he decided to subsidise a campaign to reconstruct Cyzicus. He made a substantial donation for a new temple to the Roman god Jupiter. Cyriacus thought the ruined city was awe-inspiring. He found the remains of the temple and examined it in great detail, looking for clues in ancient texts to help him understand what he was seeing. He sketched the great doorway adorned with carved foliage and mythological characters. Cyriacus’s account of this temple is the only record of this building as in the following centuries it was entirely stripped of all its stonework and all that remains is its base.\n' +
        '\n' +
        'Cyriacus also visited mainland Greece, in 1436, when no one went to Greece in order to see the country\'s ancient ruins. One of his destinations was the sanctuary of Delphi. The ancient Greeks considered Delphi as being situated in the most beautiful spot in Greece. When Cyriacus arrived at the site of Delphi, however, he found war, earthquakes and avalanches had all but obliterated its ruins. Determined to find any ancient traces, Cyriacus spent six days walking all over the area, peering at odd stone blocks sticking out of the ground, running his hands over inscriptions to trace fragments of words, and trying to puzzle out the few surviving structural remains. Climbing uphill towards the rocks that tower over the site, he came upon a theatre built into the slope. Soon after his visit, the site was buried by a rockslide and was not seen again until archaeologists began to excavate the area systematically in the late 19th century.\n' +
        '\n' +
        'His travels also took him to the city of Alexandria in Egypt, where he was captivated by the towering Pharos lighthouse, one of the ancient wonders of the world, although by his time it was already in a state of severe disrepair. With his characteristic diligence, Cyriacus sought out local scholars and fishermen to gather stories about the lighthouse\'s original grandeur. He meticulously documented the massive stone blocks that had tumbled into the harbor and attempted to sketch its probable original form based on the descriptions he collected. This record, like that of the temple at Cyzicus, later proved invaluable as the structure eventually collapsed completely due to further earthquakes. Furthermore, during his time in Egypt, he ventured to the pyramids of Giza. He correctly identified them as the tombs of ancient pharaohs, a concept that was not widely understood by Europeans at the time. He measured their bases and marvelled at the engineering feat required to construct them, leaving behind some of the earliest Renaissance descriptions of these monumental structures.\n' +
        '\n' +
        'Cyriacus had hoped to visit Ethiopia but he never got there. However, in his life he did record for posterity countless ancient monuments around the Mediterranean, paving the way for future archaeologists and cultural tourists.`,\n' +
        '    ',
    questions: [
      {
        id: 301,
        type: 'matching',
        left: ['John', 'Mary'],
        right: ['Reception', 'Library', 'Cafeteria'],
        correct: {
          0: 'Library',
          1: 'Cafeteria'
        }
      }
    ]
  },

])


/* =========================
   NAVIGATION
========================= */
const nextPassage = () => {
  if (currentPassageIndex.value < passages.value.length - 1) {
    currentPassageIndex.value++
  }
}

const finishReading = () => {
  if (timer) clearInterval(timer)

  let score = 0
  let total = 0

  passages.value.forEach(p =>
      p.questions.forEach(q => {
        total++
        if (answers.value[q.id] === q.correct) score++
      })
  )

  alert(`Reading score: ${score} / ${total}`)
  router.push('/test/writing')

}

onMounted(startTimer)
onBeforeUnmount(() => timer && clearInterval(timer))
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">

    <!-- HEADER -->
    <div class="border-b px-6 py-4 flex justify-between">
      <h1 class="text-xl font-bold">
        <span class="text-red-600 text-3xl mr-2">IELTS</span>
        Reading
      </h1>
      <div class="font-mono text-red-600 text-lg">
        ⏱ {{ formatTime(timeLeft) }}
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="flex flex-1">

      <!-- LEFT: PASSAGE -->
      <div class="w-1/2 border-r px-6 py-4 overflow-y-auto">
        <h2 class="font-semibold text-lg mb-4">
          Passage {{ currentPassageIndex + 1 }}:
          {{ passages[currentPassageIndex].title }}
        </h2>

        <p class="whitespace-pre-line leading-relaxed text-gray-800">
          {{ passages[currentPassageIndex].text }}
        </p>
      </div>

      <!-- RIGHT: QUESTIONS -->
      <div class="w-1/2 px-6 py-4 overflow-y-auto">
        <h3 class="font-semibold text-lg mb-4">
          Questions
        </h3>

        <div
            v-for="q in passages[currentPassageIndex].questions"
            :key="q.id"
            class="mb-6"
        >
          <SentenceCompletion
              v-if="q.type === 'sentence'"
              :question="q"
              v-model="answers[q.id]"
          />

          <MultipleChoice
              v-else-if="q.type === 'mcq'"
              :question="q"
              v-model="answers[q.id]"
          />
          <Matching
              v-else-if="q.type === 'matching'"
              :question="q"
              v-model="answers[q.id]"
              :locked="locked"
          />
        </div>
      </div>

    </div>

    <!-- FOOTER NAV -->
    <div class="border-t px-6 py-4 text-center">
      <button
          v-if="currentPassageIndex < passages.length - 1"
          @click="nextPassage"
          class="px-8 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-500"
      >
        Next Passage
      </button>

      <button
          v-else
          @click="finishReading"
          class="px-8 py-3 bg-green-600 text-white rounded hover:bg-green-500"
      >
        Finish Reading
      </button>
    </div>

  </div>
</template>
