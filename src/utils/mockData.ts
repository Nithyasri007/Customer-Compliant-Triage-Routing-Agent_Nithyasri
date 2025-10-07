import { Complaint, Customer, Team, ActivityEvent, Category, Priority, Sentiment, Channel } from '../types';

const categories: Category[] = ['billing', 'technical', 'delivery', 'refund', 'customer_care', 'product', 'account'];
const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];
// const statuses: Status[] = ['new', 'in_progress', 'resolved', 'escalated'];
const sentiments: Sentiment[] = ['angry', 'frustrated', 'neutral', 'satisfied'];
const channels: Channel[] = ['email', 'chat', 'phone', 'web'];

const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const complaintTemplates = [
  { category: 'billing', texts: ['I was charged twice for my subscription this month', 'My payment method was declined but I have sufficient funds', 'I see an unauthorized charge on my account', 'The invoice amount does not match what I expected', 'I need a refund for the overcharge'] },
  { category: 'technical', texts: ['The app keeps crashing when I try to upload files', 'I cannot login to my account', 'The website is running extremely slow', 'Features are not working as described', 'I am experiencing constant error messages'] },
  { category: 'delivery', texts: ['My order has not arrived yet and it has been two weeks', 'The tracking information shows my package is lost', 'I received the wrong items in my shipment', 'The delivery was damaged during shipping', 'Why is my order taking so long to process'] },
  { category: 'refund', texts: ['I would like to request a refund for my purchase', 'I returned the product but have not received my refund', 'How long does it take to process refunds', 'I was promised a refund but nothing has happened', 'The refund amount is incorrect'] },
  { category: 'customer_care', texts: ['No one is responding to my emails', 'The customer service representative was rude', 'I have been waiting on hold for 45 minutes', 'My issue has not been resolved after multiple contacts', 'I need to speak with a supervisor'] },
  { category: 'product', texts: ['The product quality is poor and not as advertised', 'This feature does not work as expected', 'I am disappointed with my purchase', 'The product arrived defective', 'The size and specifications are wrong'] },
  { category: 'account', texts: ['I cannot access my account settings', 'My account was suspended without notice', 'I need to update my personal information', 'I forgot my password and cannot reset it', 'Someone else has accessed my account'] }
];

export const generateCustomers = (count: number): Customer[] => {
  const customers: Customer[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    customers.push({
      id: `CUST${String(i + 1).padStart(4, '0')}`,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      totalComplaints: Math.floor(Math.random() * 10) + 1,
      avatar: `${firstName[0]}${lastName[0]}`
    });
  }
  return customers;
};

export const teams: Team[] = [
  {
    id: 'team-billing',
    name: 'Billing Team',
    icon: '💰',
    color: 'blue',
    email: 'billing@company.com',
    categories: ['billing', 'refund'],
    activeComplaints: 0,
    avgResponseTime: 15,
    resolutionRate: 94,
    members: [
      { id: 'u1', name: 'Sarah Johnson', role: 'Billing Specialist', avatar: 'SJ' },
      { id: 'u2', name: 'Mike Chen', role: 'Financial Analyst', avatar: 'MC' },
      { id: 'u3', name: 'Emily Davis', role: 'Billing Manager', avatar: 'ED' }
    ]
  },
  {
    id: 'team-technical',
    name: 'Technical Support',
    icon: '🔧',
    color: 'purple',
    email: 'tech@company.com',
    categories: ['technical', 'product'],
    activeComplaints: 0,
    avgResponseTime: 22,
    resolutionRate: 89,
    members: [
      { id: 'u4', name: 'Alex Kumar', role: 'Senior Engineer', avatar: 'AK' },
      { id: 'u5', name: 'Jessica Lee', role: 'Tech Support Lead', avatar: 'JL' },
      { id: 'u6', name: 'David Park', role: 'Systems Analyst', avatar: 'DP' },
      { id: 'u7', name: 'Rachel Green', role: 'Support Engineer', avatar: 'RG' }
    ]
  },
  {
    id: 'team-delivery',
    name: 'Delivery Team',
    icon: '📦',
    color: 'orange',
    email: 'delivery@company.com',
    categories: ['delivery'],
    activeComplaints: 0,
    avgResponseTime: 18,
    resolutionRate: 92,
    members: [
      { id: 'u8', name: 'Tom Wilson', role: 'Logistics Manager', avatar: 'TW' },
      { id: 'u9', name: 'Maria Garcia', role: 'Shipping Coordinator', avatar: 'MG' },
      { id: 'u10', name: 'James Brown', role: 'Fulfillment Lead', avatar: 'JB' }
    ]
  },
  {
    id: 'team-refunds',
    name: 'Refunds Team',
    icon: '💳',
    color: 'green',
    email: 'refunds@company.com',
    categories: ['refund'],
    activeComplaints: 0,
    avgResponseTime: 12,
    resolutionRate: 96,
    members: [
      { id: 'u11', name: 'Linda Martinez', role: 'Refund Specialist', avatar: 'LM' },
      { id: 'u12', name: 'Kevin White', role: 'Finance Associate', avatar: 'KW' }
    ]
  },
  {
    id: 'team-care',
    name: 'Customer Care',
    icon: '❤️',
    color: 'pink',
    email: 'care@company.com',
    categories: ['customer_care', 'account'],
    activeComplaints: 0,
    avgResponseTime: 10,
    resolutionRate: 98,
    members: [
      { id: 'u13', name: 'Amanda Taylor', role: 'Care Manager', avatar: 'AT' },
      { id: 'u14', name: 'Chris Anderson', role: 'Customer Success', avatar: 'CA' },
      { id: 'u15', name: 'Nicole Thomas', role: 'Support Agent', avatar: 'NT' }
    ]
  }
];

export const generateComplaints = (customers: Customer[], count: number): Complaint[] => {
  const complaints: Complaint[] = [];
  const now = Date.now();

  const priorityWeights = [0.1, 0.25, 0.4, 0.25];
  const categoryWeights = [0.3, 0.2, 0.15, 0.15, 0.1, 0.07, 0.03];
  const sentimentWeights = [0.2, 0.35, 0.3, 0.15];
  const channelWeights = [0.6, 0.2, 0.05, 0.15];

  const weightedRandom = (weights: number[]): number => {
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return i;
    }
    return weights.length - 1;
  };

  for (let i = 0; i < count; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const category = categories[weightedRandom(categoryWeights)];
    const priority = priorities[weightedRandom(priorityWeights)];
    const sentiment = sentiments[weightedRandom(sentimentWeights)];
    const channel = channels[weightedRandom(channelWeights)];
    const status = i < count * 0.15 ? 'new' : i < count * 0.35 ? 'in_progress' : i < count * 0.9 ? 'resolved' : 'escalated';

    const template = complaintTemplates.find(t => t.category === category);
    const description = template ? template.texts[Math.floor(Math.random() * template.texts.length)] : 'I have an issue that needs to be resolved';

    const team = teams.find(t => t.categories.includes(category)) || teams[0];
    const assignedMember = team.members[Math.floor(Math.random() * team.members.length)];

    const daysAgo = Math.pow(Math.random(), 2) * 30;
    const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const slaHours = priority === 'urgent' ? 4 : priority === 'high' ? 8 : priority === 'medium' ? 24 : 48;
    const slaDeadline = new Date(timestamp.getTime() + slaHours * 60 * 60 * 1000);

    complaints.push({
      id: `CMP${String(i + 1).padStart(5, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      subject: description.length > 50 ? description.substring(0, 50) + '...' : description,
      description,
      category,
      priority,
      sentiment,
      status,
      channel,
      teamId: team.id,
      assignedTo: status !== 'new' ? assignedMember.id : undefined,
      timestamp,
      updatedAt: new Date(timestamp.getTime() + Math.random() * 12 * 60 * 60 * 1000),
      slaDeadline,
      aiConfidence: 75 + Math.random() * 25,
      attachments: Math.random() > 0.8 ? ['screenshot.png'] : undefined,
      entities: Math.random() > 0.5 ? {
        orderId: `ORD${Math.floor(Math.random() * 100000)}`,
        amount: `$${(Math.random() * 500 + 10).toFixed(2)}`
      } : undefined
    });
  }

  complaints.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return complaints;
};

export const generateActivityEvents = (complaints: Complaint[], count: number): ActivityEvent[] => {
  const events: ActivityEvent[] = [];
  const eventTypes = [
    { type: 'classified', description: 'AI classified complaint as', icon: '🤖', color: 'purple' },
    { type: 'assigned', description: 'Complaint assigned to', icon: '👤', color: 'blue' },
    { type: 'status_change', description: 'Status changed to', icon: '📝', color: 'green' },
    { type: 'escalated', description: 'Complaint escalated', icon: '⚠️', color: 'red' },
    { type: 'resolved', description: 'Complaint resolved', icon: '✅', color: 'green' },
    { type: 'comment', description: 'New comment added', icon: '💬', color: 'gray' }
  ];

  for (let i = 0; i < count; i++) {
    const complaint = complaints[Math.floor(Math.random() * Math.min(complaints.length, 50))];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    events.push({
      id: `evt${i + 1}`,
      type: eventType.type,
      description: `${eventType.description} ${complaint.category}`,
      timestamp,
      complaintId: complaint.id,
      icon: eventType.icon,
      color: eventType.color
    });
  }

  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return events;
};

export const customers = generateCustomers(50);
export const complaints = generateComplaints(customers, 120);
export const activityEvents = generateActivityEvents(complaints, 200);

teams.forEach(team => {
  team.activeComplaints = complaints.filter(c => c.teamId === team.id && c.status !== 'resolved').length;
});
