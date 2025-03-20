export default {
  appName: 'Teatime Authority',
  teatime: {
    hour: 17, // 5 PM
    minute: 0,
    submissionWindowMinutes: 10,
  },
  fines: {
    baseAmount: 5.00, // Base fine amount in GBP
    donationRatio: 0.1, // Ratio of fine amount for donation alternative
  },
  teaTypes: [
    'English Breakfast',
    'Earl Grey',
    'Green Tea',
    'Chamomile',
    'Peppermint',
    'Herbal',
    'Other',
  ],
  maximumCommentLength: 280,
  adminContact: 'support@teatimeauthority.com',
}; 