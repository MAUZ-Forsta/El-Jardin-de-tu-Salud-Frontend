export interface Product {
  id: string;
  name: string;
  category: 'plantas' | 'tes' | 'tinturas' | 'aceites' | 'suplementos';
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  benefits: string[];
  usage: string;
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  discountId?: string;
  discountEnabled?: boolean;
}

export interface YouTubeVideo {
  id: string;       // internal UUID
  title: string;    // user-defined or auto-detected title
  url: string;      // full YouTube watch URL
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  image: string;
  price: number;
  originalPrice?: number;
  duration: string;
  lessons: number;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  description: string;
  topics: string[];
  rating: number;
  students: number;
  discountId?: string;
  discountEnabled?: boolean;
  // YouTube content
  youtubePlaylistUrl?: string;  // playlist URL → used when lessons > 10
  youtubeGroupUrl?: string;     // channel / community / group URL
  youtubeVideos?: YouTubeVideo[]; // individual videos → used when lessons ≤ 10
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Manzanilla Orgánica',
    category: 'tes',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600',
    description: 'Infusión de manzanilla 100% orgánica con propiedades calmantes y antiinflamatorias.',
    benefits: ['Reduce la ansiedad', 'Mejora el sueño', 'Alivia dolores digestivos', 'Antiinflamatoria natural'],
    usage: 'Infusionar 1 cucharadita en agua caliente (90°C) por 5-7 minutos. Tomar 2-3 veces al día.',
    rating: 4.8,
    reviews: 124,
    stock: 50,
    badge: 'Más vendido',
  },
  {
    id: '2',
    name: 'Tintura de Echinacea',
    category: 'tinturas',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1611073761742-bce90ccd60ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600',
    description: 'Extracto concentrado de Echinacea purpurea para fortalecer el sistema inmune de forma natural.',
    benefits: ['Refuerza inmunidad', 'Antiviral natural', 'Reduce duración de resfriados', 'Antiinflamatoria'],
    usage: '20-30 gotas en agua 3 veces al día durante 10 días. Descansar 1 semana entre ciclos.',
    rating: 4.7,
    reviews: 89,
    stock: 30,
    badge: 'Nuevo',
  },
  {
    id: '3',
    name: 'Aceite Esencial de Lavanda',
    category: 'aceites',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1545840716-c82e9eec6930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600',
    description: 'Aceite esencial puro de lavanda (Lavandula angustifolia) 100% natural, destilado al vapor.',
    benefits: ['Relajación profunda', 'Mejora calidad del sueño', 'Alivia dolores de cabeza', 'Antiséptico natural'],
    usage: 'Difusor: 5-10 gotas. Masaje: diluir 2-3% en aceite portador. Uso tópico con precaución.',
    rating: 4.9,
    reviews: 203,
    stock: 45,
    badge: 'Favorito',
  },
  {
    id: '4',
    name: 'Valeriana Cápsulas',
    category: 'suplementos',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1492552296703-4ec0a2fb3715?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600',
    description: 'Cápsulas de raíz de valeriana estandarizada para el sueño y la relajación naturales.',
    benefits: ['Induce el sueño natural', 'Reduce el estrés', 'Alivia la ansiedad', 'Sin efectos secundarios'],
    usage: 'Tomar 1-2 cápsulas 30 minutos antes de dormir. No exceder 4 semanas continuas.',
    rating: 4.6,
    reviews: 67,
    stock: 25,
  },
  {
    id: '5',
    name: 'Planta de Aloe Vera',
    category: 'plantas',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1675530126611-2579788c5602?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600',
    description: 'Planta de aloe vera viva, ideal para uso doméstico en cuidado de piel y digestión.',
    benefits: ['Cicatrizante cutáneo', 'Hidratante natural', 'Antiinflamatoria', 'Mejora digestión'],
    usage: 'Extraer gel de la hoja y aplicar directamente en piel, o consumir 1 cucharada del gel en ayunas.',
    rating: 4.5,
    reviews: 45,
    stock: 20,
  },
  {
    id: '6',
    name: 'Cúrcuma con Pimienta Negra',
    category: 'suplementos',
    price: 22.99,
    originalPrice: 29.99,
    image: 'https://images.unsplash.com/photo-1566792505656-e82d93abac30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600',
    description: 'Cúrcuma orgánica con pimienta negra para maximizar la absorción de curcumina.',
    benefits: ['Potente antiinflamatorio', 'Antioxidante superior', 'Salud articular', 'Protección hepática'],
    usage: 'Tomar 2 cápsulas con las comidas. La pimienta aumenta la biodisponibilidad un 2000%.',
    rating: 4.8,
    reviews: 156,
    stock: 40,
    badge: 'Oferta',
  },
  {
    id: '7',
    name: 'Moringa en Polvo',
    category: 'suplementos',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1557858281-a23455f48995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600',
    description: 'Polvo de moringa oleífera, el superalimento más nutritivo del planeta.',
    benefits: ['Rico en vitaminas y minerales', 'Energizante natural', 'Antioxidante potente', 'Regula glucosa'],
    usage: 'Añadir 1 cucharadita a smoothies, jugos o comidas. No sobrepasar 3 cucharaditas diarias.',
    rating: 4.7,
    reviews: 78,
    stock: 35,
  },
  {
    id: '8',
    name: 'Jengibre Fresco Orgánico',
    category: 'plantas',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1562957429-ff708ca20e95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600',
    description: 'Raíz de jengibre fresco orgánico certificado, ideal para infusiones y cocina medicinal.',
    benefits: ['Anti-náuseas potente', 'Antiinflamatorio', 'Mejora circulación', 'Digestivo natural'],
    usage: 'Pelar y rallar para infusiones o añadir a comidas. 2-4 g diarios es la dosis recomendada.',
    rating: 4.6,
    reviews: 92,
    stock: 60,
  },
  {
    id: '9',
    name: 'Aceite Esencial de Romero',
    category: 'aceites',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1611073761479-9a59cf8a125e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600',
    description: 'Aceite esencial de romero puro para estimular la memoria y fortalecer el cabello.',
    benefits: ['Estimula la memoria', 'Fortalece el cabello', 'Mejora la circulación', 'Energizante mental'],
    usage: 'Capilar: diluir 3-5 gotas en aceite de jojoba. Aromaterapia: 4-6 gotas en difusor.',
    rating: 4.7,
    reviews: 113,
    stock: 28,
  },
];

export const courses: Course[] = [
  {
    id: '1',
    title: 'Fitoterapia para el Hogar',
    instructor: 'Dra. María González',
    image: 'https://images.unsplash.com/photo-1758274525923-c012bbd8bfbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    price: 49.99,
    originalPrice: 89.99,
    duration: '8 horas',
    lessons: 24,
    level: 'Principiante',
    description: 'Aprende a usar las plantas medicinales más comunes para tratar afecciones cotidianas de forma segura y efectiva.',
    topics: ['Identificación de plantas medicinales', 'Preparación de infusiones y decocciones', 'Tinturas y extractos caseros', 'Primeros auxilios naturales', 'Farmacología básica de plantas'],
    rating: 4.9,
    students: 1234,
  },
  {
    id: '2',
    title: 'Aromaterapia y Aceites Esenciales',
    instructor: 'Laura Martín, Aromaterapeuta',
    image: 'https://images.unsplash.com/photo-1758274526108-49b7e3fc05aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    price: 39.99,
    duration: '6 horas',
    lessons: 18,
    level: 'Principiante',
    description: 'Descubre el poder de los aceites esenciales para el bienestar físico y emocional. Crea tus propias mezclas terapéuticas.',
    topics: ['Introducción a la aromaterapia', 'Los 20 aceites esenciales esenciales', 'Sinergias y mezclas terapéuticas', 'Aplicaciones en salud y hogar', 'Seguridad y contraindicaciones'],
    rating: 4.8,
    students: 876,
  },
  {
    id: '3',
    title: 'Nutrición Natural y Superalimentos',
    instructor: 'Carlos Vega, Naturópata',
    image: 'https://images.unsplash.com/photo-1758274526705-396a79a15ad5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    price: 59.99,
    originalPrice: 99.99,
    duration: '10 horas',
    lessons: 32,
    level: 'Intermedio',
    description: 'Transforma tu salud con la alimentación natural. Conoce los superalimentos y cómo incorporarlos en tu dieta diaria.',
    topics: ['Fundamentos de nutrición natural', 'Superalimentos del mundo', 'Detox y limpieza natural', 'Recetas saludables y medicinales', 'Suplementación inteligente'],
    rating: 4.7,
    students: 654,
  },
  {
    id: '4',
    title: 'Medicina Ayurvédica: Fundamentos',
    instructor: 'Ana Sharma, Terapeuta Ayurvédica',
    image: 'https://images.unsplash.com/photo-1758274526560-55afa7023357?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    price: 69.99,
    duration: '12 horas',
    lessons: 36,
    level: 'Avanzado',
    description: 'Sumérgete en la medicina tradicional india de 5000 años. Aprende a identificar tu dosha y equilibrar tu salud.',
    topics: ['Filosofía y principios Ayurveda', 'Los tres doshas (Vata, Pitta, Kapha)', 'Hierbas y plantas Ayurvédicas', 'Rutinas diarias de salud', 'Tratamientos y terapias básicas'],
    rating: 4.9,
    students: 432,
  },
];
