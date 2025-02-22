import React, { createElement } from "react";
import { Box, BoxContent, BoxHeader, BoxTitle } from "./box";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Brain, Heart, BookOpen, Users, Activity } from "lucide-react";

type TraitItem = {
  subtitle: string;
  content: string;
  customContent?: React.ReactNode;
};

type Trait = {
  title: string;
  items: TraitItem[];
  customContent?: React.ReactNode;
  icon: React.ElementType;
  color: string;
};

const traits: Trait[] = [
  {
    title: "Dispositional Attributes",
    icon: Brain,
    color: "bg-blue-50",
    items: [
      {
        subtitle: "Personality",
        content:
          "Big Five traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)",
      },
      {
        subtitle: "Cognitive Abilities",
        content: "IQ, problem-solving skills, and learning capacity",
      },
      {
        subtitle: "Emotional Intelligence",
        content: "Ability to perceive, use, understand, and manage emotions",
      },
    ],
  },
  {
    title: "Motivational and Value Systems",
    icon: Heart,
    color: "bg-red-50",
    items: [
      {
        subtitle: "Values, Goals, and Beliefs",
        content:
          "Including spiritual/existential dimensions and core life principles",
      },
      {
        subtitle: "Interests and Hobbies",
        content:
          "Leisure pursuits and passions that provide personal fulfillment",
      },
    ],
  },
  {
    title: "Life History and Personal Development",
    icon: BookOpen,
    color: "bg-green-50",
    items: [
      {
        subtitle: "Past Experiences",
        content: "Significant life events and narrative history",
      },
      {
        subtitle: "Dynamic Personal Evolution",
        content:
          "Ongoing changes, growth, and current emotional/mental states (e.g., mood fluctuations, coping strategies)",
      },
    ],
  },
  {
    title: "Social and Environmental Context",
    icon: Users,
    color: "bg-yellow-50",
    items: [
      {
        subtitle: "Social Connections",
        content:
          "Quality, nature, and dynamics of relationships and support networks",
      },
      {
        subtitle: "Context and Demographics",
        content:
          "Cultural background, socioeconomic status, education, identity markers (e.g., gender, sexual orientation), and current life circumstances (living situation, work environment, etc.)",
      },
    ],
  },
  {
    title: "Health",
    icon: Activity,
    color: "bg-purple-50",
    items: [
      {
        subtitle: "Physical Health",
        content: "General condition, fitness, and medical history",
      },
      {
        subtitle: "Mental Health and Wellbeing",
        content:
          "Psychological state, resilience, stress coping, and overall mental wellness",
      },
    ],
  },
];

export default function PersonalityTraits() {
  return (
    <div className="space-y-6">
      {traits.map((trait, index) => (
        <Box key={index} className={trait.color}>
          <BoxHeader>
            <BoxTitle className="flex items-center gap-2">
              {createElement(trait.icon, { className: "w-6 h-6" })}
              {trait.title}
            </BoxTitle>
          </BoxHeader>
          <BoxContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trait.items.map((item, itemIndex) => (
                <Card key={itemIndex}>
                  <CardHeader>
                    <CardTitle>{item.subtitle}</CardTitle>
                  </CardHeader>
                  <CardContent>{item.customContent}</CardContent>
                </Card>
              ))}
            </div>
          </BoxContent>
        </Box>
      ))}
    </div>
  );
}
