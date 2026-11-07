export interface TeamMember {
  id: string;
  name: string;
  position: string;
  image?: string;
  linkedin?: string;
}

export interface TeamGroup {
  id: string;
  title: string;
  eyebrow: string;
  description?: string;
  isLeadership?: boolean;
  members: TeamMember[];
}

export const executiveBoardGroups: TeamGroup[] = [
  {
    id: "general-secretaries",
    title: "General Secretaries",
    eyebrow: "GenSec",
    isLeadership: true,
    members: [
      {
        id: "sanchit-sehgal",
        name: "Sanchit Sehgal",
        position: "General Secretary",
        image: "/images/eb/sanchit.jpg",
        linkedin: "https://www.linkedin.com/in/sanchitsehgal/",
      },
      {
        id: "shashank-jain",
        name: "Shashank Jain",
        position: "General Secretary",
        image: "/images/eb/shashank-jain.jpeg",
        linkedin: "https://www.linkedin.com/in/shashank-jain-ngn/",
      },
      {
        id: "devyansh-arya",
        name: "Devyansh Arya",
        position: "General Secretary",
        image: "/images/eb/dev.jpeg",
        linkedin: "https://www.linkedin.com/in/devyansh-arya-4b8b901b5/",
      },
    ],
  },
  {
    id: "joint-secretaries",
    title: "Joint Secretaries",
    eyebrow: "JointSec",
    members: [
      {
        id: "aadish-jain",
        name: "Aadish Jain",
        position: "Joint Secretary",
        image: "/images/eb/aadish-jain.jpg",
        linkedin: "https://www.linkedin.com/in/aadishjain20/",
      },
      {
        id: "lakshya-goyal",
        name: "Lakshya Goyal",
        position: "Joint Secretary",
        image: "/images/eb/lakshya.jpg",
        linkedin: "https://www.linkedin.com/in/lakshya-goyal-070308229/",
      },
      {
        id: "nishtha-saha",
        name: "Nishtha Saha",
        position: "Joint Secretary",
        image: "/images/eb/nishtha.png",
        linkedin: "https://www.linkedin.com/in/nishtha-saha-2355352a6/",
      },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    eyebrow: "FinSec",
    members: [
      {
        id: "parth-gakhar",
        name: "Parth Gakhar",
        position: "Finance Secretary",
        image: "/images/eb/parth.jpeg",
        linkedin: "https://www.linkedin.com/in/parth-gakhar-427913324/",
      },
    ],
  },
  {
    id: "department-heads",
    title: "Department Heads",
    eyebrow: "Department Heads",
    members: [
      {
        id: "sparsh-gupta",
        name: "Sparsh Gupta",
        position: "Head of Entrepreneurship",
        image: "/images/eb/sparsh.jpg",
        linkedin: "https://www.linkedin.com/in/sparsh-gupta-3976aa337/",
      },
      {
        id: "nimitt-malhotra",
        name: "Nimitt Malhotra",
        position: "Head of Operations",
        image: "/images/eb/nimitt.jpeg",
        linkedin: "https://www.linkedin.com/in/nimitt-malhotra-912bb22b3/",
      },
      {
        id: "liya",
        name: "Liya",
        position: "Head of Operations",
        image: "/images/eb/liya.jpg",
        linkedin: "https://www.linkedin.com/in/liyamittal/",
      },

      {
        id: "namandeep-jindal",
        name: "Namandeep Jindal",
        position: "Marketing and External Secretary",
        image: "/images/eb/naman.png",
        linkedin: "https://www.linkedin.com/in/namandeep-jindal-b307b132b/",
      },

      {
        id: "bhuvan-malhotra",
        name: "Bhuvan Malhotra",
        position: "Marketing and External Secretary",
        image: "/images/eb/bhuvan.jpeg",
        linkedin: "https://www.linkedin.com/in/bhuvan-malhotra-2629b82b2/",
      },

      {
        id: "vidhi-saxena",
        name: "Vidhi Saxena",
        position: "Technical Secretary",
        image: "/images/eb/vidhi.jpg",
        linkedin: "https://www.linkedin.com/in/vidhi-saxena-ab2547346/",
      },

      {
        id: "vansh-goyal",
        name: "Vansh Goyal",
        position: "Media and Design Secretary",
        image: "/images/eb/vansh-goyal.jpeg",
        linkedin: "https://www.linkedin.com/in/vansh-goyal-60033a21a/",
      },
    ],
  },
  {
    id: "co-conveners",
    title: "Co-Conveners",
    eyebrow: "Co-Conveners",
    members: [
      {
        id: "vasu-garg",
        name: "Vasu Garg",
        position: "Co-Convener",
        image: "/images/eb/vasu-garg.jpeg",
        linkedin: "https://www.linkedin.com/in/vasu-garg-7b61a8337/",
      },
      {
        id: "ruhan-garg",
        name: "Ruhan Garg",
        position: "Co-Convener",
        image: "/images/eb/ruhan.jpeg",
        linkedin: "https://www.linkedin.com/in/ruhangarg/",
      },
      {
        id: "vishesh-nagpure",
        name: "Vishesh Nagpure",
        position: "Co-Convener",
        image: "/images/eb/vishesh.jpeg",
        linkedin: "https://www.linkedin.com/in/vishesh-nagpure-10a9b22b7/",
      },
    ],
  },
];
