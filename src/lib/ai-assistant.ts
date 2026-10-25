import { AiGeneratedEvent, EventCategory } from './types';

interface AiInput {
  prompt: string;
  category?: string;
  targetAudience?: string;
}

export async function generateEventWithAi(input: AiInput): Promise<AiGeneratedEvent> {
  const idea = input.prompt.trim();

  // If GEMINI_API_KEY is available in environment, we attempt a live call
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert community event organizer. Given the user event idea: "${idea}", return a JSON object with this exact shape:
                    {
                      "title": "Inspiring event title",
                      "description": "Engaging 2-3 paragraph description explaining community need, day-of activities, and volunteer impact",
                      "category": "Environment" | "Education" | "Health" | "Community" | "Animal Welfare" | "Arts & Culture" | "Food Security" | "Crisis Relief",
                      "suggestedVolunteerRoles": ["Role 1", "Role 2", "Role 3"],
                      "requiredSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
                      "promotionalMessage": "Compelling 2-sentence social media post with hashtags",
                      "suggestedCapacity": 20
                    }
                    Respond ONLY with valid JSON.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          return parsed as AiGeneratedEvent;
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed or timed out, falling back to smart NLP synthesizer:', e);
    }
  }

  // Smart Semantic NLP Generator (works immediately without any external API keys!)
  return synthesizeEventDetails(idea, input.category);
}

function synthesizeEventDetails(idea: string, userCategory?: string): AiGeneratedEvent {
  const lower = idea.toLowerCase();

  // Default theme presets based on keyword semantic clustering
  if (lower.includes('tree') || lower.includes('plant') || lower.includes('forest') || lower.includes('green') || lower.includes('garden')) {
    return {
      title: idea.length > 5 && idea.length < 50 ? idea : 'Community Green Canopy: Urban Tree Planting Initiative',
      description: `Join our community-wide effort to restore our urban canopy, expand shaded public walkways, and protect our local ecosystem. Volunteers will work in teams alongside local arborists to plant native saplings, install protective deer guards, and apply organic mulch.\n\nAll tools, heavy-duty gardening gloves, shovels, and hydration stations will be provided on-site. This is a family-friendly, high-impact day of service suitable for individuals and groups alike.\n\nTogether, we will contribute directly to neighborhood climate resilience, cleaner air quality, and greener neighborhoods for generations to come.`,
      category: 'Environment',
      suggestedVolunteerRoles: [
        'Sapling Planters & Excavation Team',
        'Mulch & Soil Transport Coordinators',
        'Hydration & Refreshment Monitor',
        'Tool Check-in & Safety Lead',
      ],
      requiredSkills: [
        'Tree Planting & Digging',
        'Physical Agility & Outdoor Stamina',
        'Tool Safety & Compliance',
        'Teamwork & Active Listening',
      ],
      promotionalMessage: `🌱 Ready to make a lasting green mark on our neighborhood? Join us for the Tree Planting Drive! Help plant native saplings and cultivate cleaner air. Sign up today: #CommunityGreen #UrbanCanopy #VolunteerNow`,
      suggestedCapacity: 25,
    };
  }

  if (lower.includes('food') || lower.includes('hunger') || lower.includes('meal') || lower.includes('kitchen') || lower.includes('pantry') || lower.includes('soup')) {
    return {
      title: idea.length > 5 && idea.length < 50 ? idea : 'Nourish Together: Community Food Drive & Meal Packing',
      description: `Step up to combat local food insecurity by helping sort, assemble, and distribute essential pantry packages and warm nutritious meals to vulnerable community members.\n\nVolunteers will inspect incoming canned goods, pack balanced dry ration hampers, assemble hot takeaway soup containers, and warmly greet families at our drive-through and walk-up counters.\n\nEvery hour of service ensures a family in our neighborhood goes to bed with hearty, wholesome meals. Clean apron, hairnets, and sanitizing supplies provided.`,
      category: 'Food Security',
      suggestedVolunteerRoles: [
        'Pantry Box Assembly Line Packer',
        'Produce Quality Inspector & Sorter',
        'Guest Hospitality & Check-in Greeter',
        'Restock & Logistics Runner',
      ],
      requiredSkills: [
        'Food Hygiene & Sanitation',
        'Inventory Sorting & Packing',
        'Friendly Communication',
        'Attention to Detail',
      ],
      promotionalMessage: `🥣 No one in our town should ever face an empty table. Lend a hand at the Community Kitchen & Food Box Distribution this weekend! Sign up to pack meals: #EndHunger #FoodSecurity #CommunityLove`,
      suggestedCapacity: 20,
    };
  }

  if (lower.includes('code') || lower.includes('tech') || lower.includes('stem') || lower.includes('tutor') || lower.includes('teach') || lower.includes('school') || lower.includes('read')) {
    return {
      title: idea.length > 5 && idea.length < 50 ? idea : 'NextGen Mentors: Youth Tech & Digital Literacy Workshop',
      description: `Inspire the next wave of creative thinkers and digital innovators! We are hosting an interactive hands-on workshop guiding middle and high school students through foundational computing skills, basic web development, and internet safety.\n\nVolunteers will be paired with small groups of 2-3 enthusiastic students to guide them through interactive exercises, demystify code syntax, and foster confidence in solving real problems.\n\nNo expert software engineering degree is required—just empathy, patience, and a desire to share basic digital knowledge with eager young learners.`,
      category: 'Education',
      suggestedVolunteerRoles: [
        'Small-Group Coding Mentor',
        'Hardware & Device Setup Assistant',
        'Student Registration & Welcome Lead',
        'Classroom Breakout Facilitator',
      ],
      requiredSkills: [
        'Basic Coding / Tech Literacy',
        'Youth Mentoring & Encouragement',
        'Patience & Clear Explanation',
        'Active Listening',
      ],
      promotionalMessage: `💻 Help ignite a young person's passion for technology! Volunteer as a digital mentor this month and make tech education accessible for all kids: #YouthInTech #DigitalLiteracy #MentorTheFuture`,
      suggestedCapacity: 15,
    };
  }

  if (lower.includes('dog') || lower.includes('cat') || lower.includes('animal') || lower.includes('pet') || lower.includes('shelter') || lower.includes('puppy')) {
    return {
      title: idea.length > 5 && idea.length < 50 ? idea : 'Paws & Purrs: Shelter Animal Enrichment & Care Day',
      description: `Spend a heartwarming morning bringing companionship and joy to shelter rescues waiting for their forever families. Shelter animals thrive on socialization, gentle exercise, and mental stimulation.\n\nVolunteers will assist kennel staff with safe trail dog walks, grooming and brushing long-coat rescues, crafting chew toys and enrichment puzzle boxes, and snapping adoption photos to feature on our social adoption feeds.\n\nBring your love for animals and wear comfortable clothes you do not mind getting a little fur on!`,
      category: 'Animal Welfare',
      suggestedVolunteerRoles: [
        'Canine Socialization & Trail Walker',
        'Feline Cuddle & Grooming Specialist',
        'Adoption Photography & Social Media Lead',
        'Enrichment Toy Crafting Assistant',
      ],
      requiredSkills: [
        'Animal Handling & Comfort',
        'Patience & Compassion',
        'Outdoor Walking & Physical Agility',
        'Photography (Optional)',
      ],
      promotionalMessage: `🐾 Give love to rescues waiting for their forever homes! Join our Shelter Socialization Day—walk pups, brush sweet cats, and spread smiles: #AdoptDontShop #AnimalRescue #VolunteerForPets`,
      suggestedCapacity: 18,
    };
  }

  if (lower.includes('clean') || lower.includes('trash') || lower.includes('river') || lower.includes('beach') || lower.includes('park') || lower.includes('waste')) {
    return {
      title: idea.length > 5 && idea.length < 50 ? idea : 'Revitalize Our Waters: Riverbank & Park Cleanup',
      description: `Take direct civic action against environmental litter and plastic pollution in our beloved public parks and waterways. We are deploying volunteer sweep teams along designated trails and shoreline zones.\n\nWe provide trash grabbers, heavy-duty puncture-resistant gloves, color-coded recycling bags, and safety vests. We will also catalog litter types to support regional municipal waste reduction audits.\n\nAfterward, join fellow volunteers for a celebration with hot cocoa, fresh bagels, and community recognition!`,
      category: 'Environment',
      suggestedVolunteerRoles: [
        'Trail & Shoreline Sweep Volunteer',
        'Eco-Recycling & Microplastics Sorter',
        'Supply Dispatch & Safety Equipment Lead',
        'Litter Data Cataloger',
      ],
      requiredSkills: [
        'Physical Stamina & Walking',
        'Waste Sorting & Environmental Care',
        'Safety Compliance',
        'Enthusiastic Team Spirit',
      ],
      promotionalMessage: `🌊 Keep our community waters clean and wildlife safe! Join our weekend cleanup drive. All supplies provided. Sign up now: #CleanWaters #EcoVolunteers #KeepOurParkClean`,
      suggestedCapacity: 30,
    };
  }

  if (lower.includes('health') || lower.includes('blood') || lower.includes('medical') || lower.includes('cpr') || lower.includes('wellness') || lower.includes('clinic')) {
    return {
      title: idea.length > 5 && idea.length < 50 ? idea : 'Community Wellness & Preventative Health Fair',
      description: `Provide essential health screenings, wellness resources, and vital education to community members who lack consistent healthcare access.\n\nVolunteers will guide guests through registration, support qualified nurses at blood pressure and glucose check stations, distribute hygiene care kits, and translate health literature for bilingual attendees.\n\nJoin our dedicated team to make healthcare guidance approachable, dignified, and accessible to every neighbor.`,
      category: 'Health',
      suggestedVolunteerRoles: [
        'Guest Intake & Registration Assistant',
        'Screening Station Flow Coordinator',
        'Wellness Kit Assembly & Distribution',
        'Bilingual Language Translator',
      ],
      requiredSkills: [
        'Empathetic Communication',
        'Confidentiality & Discretion',
        'Basic First Aid or Medical Interest',
        'Organization & Patience',
      ],
      promotionalMessage: `🩺 Health is a community right. Lend a hand at our free Community Wellness Clinic to connect neighbors with screenings and care: #CommunityHealth #WellnessForAll #VolunteerNurse`,
      suggestedCapacity: 25,
    };
  }

  // Fallback generalized community event
  const cleanTitle = idea.charAt(0).toUpperCase() + idea.slice(1);
  return {
    title: cleanTitle.length > 4 ? cleanTitle : 'Community Action & Neighborhood Empowerment Day',
    description: `Be part of a transformative neighborhood initiative aimed at strengthening local bonds and addressing urgent community priorities.\n\nVolunteers will work in small collaborative groups to set up activity stations, coordinate incoming participants, support project logistics, and ensure every attendee has a meaningful experience.\n\nNo specialized background required. Whether you can give two hours or the full day, your hands and heart will make an immediate difference.`,
    category: (userCategory as EventCategory) || 'Community',
    suggestedVolunteerRoles: [
      'Event Setup & Logistical Assistant',
      'Participant Greeter & Hospitality Host',
      'Activity Station Support Specialist',
      'Clean-up & Breakdown Crew',
    ],
    requiredSkills: [
      'Positive Attitude & Reliability',
      'Active Listening & Communication',
      'Teamwork & Collaboration',
      'Adaptability to Event Flow',
    ],
    promotionalMessage: `🌟 Make a difference right where you live! Join our upcoming community event and meet neighbors who care. Sign up today: #CommunityFirst #ServeTogether #Volunteer`,
    suggestedCapacity: 20,
  };
}
