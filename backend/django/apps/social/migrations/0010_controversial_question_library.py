from django.db import migrations
from django.utils import timezone


QUESTIONS = [
    {
        "category": "All thoughts",
        "text": "Can someone be a good person and still do something unforgivable?",
        "depth": "challenging",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is honesty always the right thing, even when it destroys someone's happiness?",
        "depth": "challenging",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Have you ever judged someone for something you've secretly done yourself?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Do people genuinely change, or do they simply learn to hide their worst traits?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is it worse to betray someone or to make them feel foolish for trusting you?",
        "depth": "challenging",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Can you love someone and still secretly envy them?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is being a nice person sometimes just a way to avoid confrontation?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Would you rather be respected by everyone or deeply loved by one person?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is keeping a secret from someone the same as lying to them?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Can a good intention justify a terrible decision?",
        "depth": "challenging",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Do people deserve second chances if they haven't changed?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is judging someone for their past fair if their present behavior is different?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Would you rather know the uncomfortable truth about yourself or remain happy with who you think you are?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is loyalty still admirable when the person you're loyal to is wrong?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Can someone be morally right but still be a terrible person?",
        "depth": "challenging",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is forgiveness something everyone deserves, or something people must earn?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Do people help others because they care, or because helping makes them feel good about themselves?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is it hypocritical to criticize behavior you've engaged in yourself?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "If everyone around you believes something is right, would you question it?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is ignorance sometimes better than knowing the truth?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Can you be a good person if you only do good things when people are watching?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Should people be judged more by their intentions or by the consequences of their actions?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is silence a form of agreement when someone is doing something wrong?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "If someone never finds out they were betrayed, does the betrayal still matter?",
        "depth": "challenging",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is being misunderstood sometimes your own fault?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Would you expose a truth that would destroy a family but free an innocent person?",
        "depth": "challenging",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is it possible to be completely selfless?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Are some people only kind because they've never had enough power to be cruel?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Does having a difficult childhood explain bad behavior, or can it become an excuse?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "If your private thoughts were made public, would people still see you the same way?",
        "depth": "challenging",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is it more important to be fair or to be loyal?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Can someone deserve happiness even after causing someone else years of pain?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Would you rather be disliked for telling the truth or loved for pretending?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "Is revenge ever morally justified?",
        "depth": "challenging",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "All thoughts",
        "text": "If you could erase one mistake from your past but lose everything you learned from it, would you?",
        "depth": "reflective",
        "styles": [
            "beliefs",
            "moral-dilemma"
        ]
    },
    {
        "category": "Relationships",
        "text": "Can you genuinely love two people romantically at the same time?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is emotional cheating worse than physical cheating?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "If your partner cheats once and confesses immediately, would you stay?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Should someone tell their partner about every person they've slept with?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is it wrong to stay with someone you no longer love because they treat you well?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Can you truly love someone and still be attracted to other people?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is financial stability more important than romantic chemistry?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Should a person ever marry someone they love but don't fully trust?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is checking your partner's phone ever justified?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "If your partner's family dislikes you, should your partner choose you over them?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is it acceptable to keep an ex as a close friend while in a new relationship?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Should couples share all their passwords?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Can a relationship survive if only one person is putting in most of the effort?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is staying together for the children selfless or harmful?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Would you marry someone who earns significantly less than you?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Should the person who earns more have more say in financial decisions?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is it a red flag if someone has never had a serious relationship?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Would you rather have a loyal partner who doesn't understand you or a partner who understands you but is unreliable?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Can someone be a great partner but still not be the right person to marry?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is falling out of love a valid reason to leave someone who has done nothing wrong?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Should you forgive cheating if you believe your partner is genuinely remorseful?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is it disrespectful for your partner to find other people attractive?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "If your partner became financially unsuccessful, would your attraction to them change?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Should couples split everything 50/50 regardless of their income?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is it better to be single than to settle for someone who loves you more than you love them?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Would you stay with someone who is perfect for you but whom your family will never accept?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is jealousy proof that someone cares, or proof that they don't trust you?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Should partners tell each other the harshest things their friends say about them?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "If someone truly loves you, should you ever have to ask them to make you a priority?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Can a relationship be healthy when one person needs much more attention and reassurance than the other?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is it okay to leave a partner during their hardest period if the relationship is destroying your own well-being?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Should you forgive a partner who cheated years ago if you only discover it today?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is sexual compatibility important enough to end an otherwise loving relationship?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Would you rather be someone's first love or the person they finally learned how to love properly?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is marriage still worth pursuing if you can have love, companionship and financial independence without it?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Should couples disclose their exact salaries, debts and savings to each other?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Can someone who cheated in a previous relationship be completely trustworthy in their next one?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "If your partner asked you to choose between them and your lifelong dream, what would your answer reveal?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is it manipulative to threaten to leave during an argument, even if you mean it?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Would you rather have a passionate relationship that may not last or a peaceful relationship with less excitement?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Should a person ever sacrifice a major career opportunity for their partner?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is it possible to forgive someone without ever trusting them again?",
        "depth": "reflective",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "If your partner's personality changed significantly after marriage, would you feel deceived?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "Is love a choice you keep making or a feeling you cannot control?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Relationships",
        "text": "What's worse: being cheated on or discovering that your partner has been pretending to love you?",
        "depth": "challenging",
        "styles": [
            "relationships",
            "values"
        ]
    },
    {
        "category": "Friendship",
        "text": "Can you truly be friends with someone whose success makes you feel insecure?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Should a real friend tell you when your partner isn't good enough for you?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is it betrayal if your friend dates someone you used to love?",
        "depth": "challenging",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Would you end a friendship because your friend became friends with someone who hurt you?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Can a friendship survive one person becoming significantly wealthier than the other?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is it okay to distance yourself from a friend who is always struggling financially?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Should friends lend each other money even when repayment is uncertain?",
        "depth": "challenging",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is a friend who never checks on you really your friend?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Can you be happy for a friend while secretly wishing you had their life?",
        "depth": "challenging",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is it worse for a friend to gossip about you or to remain silent when others gossip about you?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Should you tell a friend's partner if you know they're cheating?",
        "depth": "challenging",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is it selfish to outgrow friends who have been there for you during difficult times?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Can you remain close friends with someone whose values you strongly disagree with?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Should friendship require equal effort, or is it normal for one person to give more?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is it wrong to stop helping a friend who repeatedly makes the same bad decisions?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Would you forgive a friend who revealed your secret during an argument?",
        "depth": "challenging",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Can a person be a good friend to you but a terrible person to everyone else?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is it acceptable to be friends with someone you secretly dislike?",
        "depth": "challenging",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Should friends tell each other exactly how much money they earn?",
        "depth": "challenging",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "If your friend copied your business idea and succeeded, would you still support them?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is it possible to be too available for your friends?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Would you choose a childhood friend over a newer friend who understands you better?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is jealousy between friends inevitable, or does it mean the friendship is unhealthy?",
        "depth": "challenging",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Should you confront a friend who only contacts you when they need something?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Would you rather have one friend who tells you brutal truths or ten friends who always support you?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is it wrong to become less available to friends after entering a serious relationship?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "If your friend repeatedly disrespects your boundaries but has good intentions, how much patience do they deserve?",
        "depth": "challenging",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Should you invite a successful friend to an event if their presence makes you feel inferior?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Is keeping your distance from a struggling friend self-preservation or abandonment?",
        "depth": "reflective",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Friendship",
        "text": "Can friendship be genuine when both people are secretly competing with each other?",
        "depth": "challenging",
        "styles": [
            "friendship",
            "loyalty"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Are you actually becoming a better person, or just becoming better at explaining your behavior?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is self-love sometimes an excuse for selfishness?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Can you heal without ever receiving an apology?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is your personality really who you are, or who you learned to be to survive?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Do people use “protecting my peace” to avoid difficult conversations?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is it possible to be too self-aware?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Would you rather discover that you've wasted ten years or spend another ten years pursuing the wrong thing?",
        "depth": "vulnerable",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Are you afraid of failure, or afraid people will see you fail?",
        "depth": "vulnerable",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is discipline more important than motivation, or do people use discipline to shame those facing difficult circumstances?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Can someone genuinely change without losing friends who prefer the old version of them?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is it better to accept yourself or continuously work to become someone different?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Are your standards too high, or are you using them to avoid being vulnerable?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "What if the person holding you back from your dream is you?",
        "depth": "vulnerable",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is healing supposed to make you happier, or simply more honest about your life?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Do you owe your family success because they sacrificed for you?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is it selfish to choose your own happiness over your family's expectations?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Would you rather be successful and misunderstood or ordinary and deeply loved?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Can you outgrow someone without thinking you're better than them?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is being afraid of commitment sometimes just fear of choosing the wrong life?",
        "depth": "vulnerable",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Do people genuinely want the truth about themselves, or only a version they can accept?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is confidence something you build, or something you fake until you believe it?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Can someone be ambitious and still be afraid of success?",
        "depth": "vulnerable",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is constantly trying to improve yourself a sign of growth or a sign that you don't think you're enough?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Should your younger self be proud of the person you've become?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is it possible to forgive yourself for something you would never forgive another person for?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Would you rather know your biggest weakness or your biggest blind spot?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is your comfort zone protecting you or slowly ruining your potential?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Can you become the person you want to be without disappointing the people who know you now?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is being emotionally independent healthy, or can it become an inability to let people help you?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "What's harder: admitting you're wrong or admitting that you've been wrong for years?",
        "depth": "vulnerable",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Do you actually want to achieve your dreams, or do you love imagining the person you'll become when you do?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Is your fear of being judged stronger than your desire to live honestly?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Would you rather have your biggest insecurity exposed or your biggest regret revealed?",
        "depth": "vulnerable",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "Can you be grateful for your life and still deeply unhappy with it?",
        "depth": "vulnerable",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Personal growth",
        "text": "If nobody could ever praise or criticize you, would you make the same choices you're making now?",
        "depth": "reflective",
        "styles": [
            "self-reflection",
            "growth"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Would you sacrifice your integrity to build a successful business if nobody would ever find out?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is a wealthy person more successful than someone who is fulfilled but earns little?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Should founders pay themselves well while their employees struggle financially?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is networking genuine relationship-building or just strategic friendship?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Would you rather build a business that changes lives or one that makes you extremely rich?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is it ethical to charge as much as customers are willing to pay, even when the service costs very little to provide?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Should a founder fire a loyal employee who is no longer good at their job?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is working 80 hours a week dedication or poor life management?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Would you accept a business partner you dislike if they could double your chances of success?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is a business that makes money by exploiting people's insecurities automatically unethical?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Should you hire a less qualified friend over a more qualified stranger?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is failure in business a sign of poor judgment or a necessary cost of trying?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Would you sell a company you built from scratch if the offer would make you wealthy but end its original mission?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is it fair for a business owner to become rich from an idea while employees do most of the work?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Should companies prioritize employee well-being over maximizing profit?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is a founder who exaggerates a product's potential to attract investors dishonest or simply ambitious?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Would you rather be the best employee in a company or an average founder of your own company?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Does money reveal someone's character or change it?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is it wrong to charge struggling customers premium prices if your product genuinely helps them?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Should a founder give equity to an early employee who joined when the company was worth almost nothing?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is copying a successful competitor smart business or a lack of originality?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Would you accept an investment from someone whose values conflict with yours?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is financial independence more important than doing meaningful work?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Should people be judged for choosing a stable job over entrepreneurship?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is a startup founder's obsession with success admirable if their family suffers because of it?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "If a competitor copied your product and executed it better, would they deserve to win?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is it ethical to use psychological tricks to make customers buy something they don't need?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Would you rather earn less from a business you love or more from one you find meaningless?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Does a university degree still prove intelligence or competence?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is being busy a status symbol people use to feel important?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Should successful entrepreneurs feel responsible for helping people who are less fortunate?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is it wrong to build a company primarily to sell it rather than to serve its customers long-term?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Would you take credit for a team's success if doing so were the only way to secure your promotion?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "Is having a wealthy family an unfair advantage, or simply a resource people should use without guilt?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Business & ambition",
        "text": "If your business could become highly profitable by collecting more personal data than customers realize, would you do it?",
        "depth": "challenging",
        "styles": [
            "ambition",
            "ethics"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If your memories were replaced but your personality stayed the same, would you still be you?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Is there a truth about yourself you're afraid to discover?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If you could know the exact date of your death, would you want to?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Would you rather be loved for someone you're not or misunderstood for who you really are?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If doing the right thing guaranteed you would suffer, would you still do it?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Can two people remember the same event honestly but have completely different truths?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If you could erase every painful memory, would you still be the same person?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Is loneliness worse when you're alone or when you're surrounded by people who don't understand you?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Do we love people for who they are or for how they make us feel about ourselves?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If nobody remembered you after your death, would your achievements matter less?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Can you truly know another person, or do you only know the version they allow you to see?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Is morality something we discover or something society invents?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If you could learn one absolute truth about human nature, what would you want to know?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Is a peaceful life better than a meaningful life if meaning requires suffering?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If everyone could hear your thoughts for one day, which relationship would change first?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Can someone be completely free if their choices are shaped by their upbringing?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Would you rather know the truth about every person you love or preserve some of your illusions?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Is the person you are in private more authentic than the person you show the world?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If you could relive your life with all your current knowledge, would you make different choices?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Can you truly forgive someone if you still want them to understand how much they hurt you?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Is there a difference between being alive and actually living?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Would you rather have a short life full of meaning or a long life that feels ordinary?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If someone does something terrible for a good reason, how should we judge them?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Are human beings fundamentally selfish, or do we learn selfishness from the world?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If you could know exactly what everyone thinks of you, would you want that knowledge?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Is it possible to love someone without wanting anything from them?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If your happiest memory turned out to be based on a lie, would you want to know?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Is the truth always worth knowing when you cannot change what it means?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Can you be completely honest with another person without hurting them?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Do we fear death itself, or the possibility that our lives won't have mattered?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If you could remove one emotion from humanity, which would create the biggest benefit — and what would we lose?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Can someone be happy without having a purpose?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Would you rather be understood by one person completely or admired by millions who barely know you?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "Is it possible to live without ever betraying some part of yourself?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Deep conversations",
        "text": "If you met the person you could have become under different circumstances, would you like them more than yourself?",
        "depth": "vulnerable",
        "styles": [
            "meaning",
            "human-nature"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it rude to leave someone on read when you have no energy to reply?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Should guests help wash dishes after eating at someone's house?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is arriving 30 minutes late disrespectful or normal in some social settings?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it acceptable to cancel plans simply because you no longer feel like going?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Should people be expected to reply to messages immediately?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is posting your relationship online a sign of happiness or a need for validation?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it embarrassing to be broke among friends who have money?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Should people split the bill equally when one person ordered much more than everyone else?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it rude to ask someone how much they earn?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it okay to use your phone while someone is telling you a story?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Should you tell a friend that their outfit looks bad before an important event?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it disrespectful to watch a movie or read messages while on a date?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is being an introvert sometimes used as an excuse for poor communication?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Should people stop asking couples when they're getting married?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it okay to eat food someone offers you even if you don't like it, then pretend you enjoyed it?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it rude to borrow something and return it only after being asked?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Should parents be expected to financially support their adult children?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it acceptable to unfollow a friend because their social media posts annoy you?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Would you rather have a friend who always arrives late or one who cancels at the last minute?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it worse to spoil a movie ending or to reveal a secret someone told you?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Should someone who earns more always pay when friends go out together?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it rude to ask someone why they're still single?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Should people be expected to invite all their friends to major celebrations?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it okay to pretend you didn't see someone in public because you don't want to talk?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Can you judge someone's personality by how they treat waiters, cleaners, or service workers?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it acceptable to borrow money from a friend while spending on nonessential things?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Should couples share their live location with each other?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it wrong to read a message from someone else's phone if it appears on the screen?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it better to be brutally honest about someone's cooking or pretend you enjoyed it?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is someone who never posts on social media more private or simply less interested in sharing?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Should friends tell you when your jokes are offensive, even if everyone else laughs?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it okay to attend an event mainly because you want to network rather than because you care about the host?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is buying expensive things to impress people always a waste of money?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Is it rude to ask for your money back when you paid for a friend who promised to repay you?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    },
    {
        "category": "Fun & everyday life",
        "text": "Would you rather have someone who always tells you what's on their mind or someone who thinks carefully before speaking?",
        "depth": "surface",
        "styles": [
            "everyday",
            "social-norms"
        ]
    }
]


def add_questions(apps, schema_editor):
    Question = apps.get_model('social', 'Question')
    now = timezone.now()
    # Preserve legacy answers and history, but keep the older generic prompts
    # out of the active pool so the published experience has one clear voice.
    Question.objects.filter(status='published').update(status='archived')
    for item in QUESTIONS:
        question, _ = Question.objects.get_or_create(text=item['text'])
        question.category = item['category']
        question.depth = item['depth']
        question.styles = item['styles']
        question.status = 'published'
        question.published_at = question.published_at or now
        question.save(update_fields=('category', 'depth', 'styles', 'status', 'published_at'))


def remove_questions(apps, schema_editor):
    Question = apps.get_model('social', 'Question')
    Question.objects.filter(text__in=[item['text'] for item in QUESTIONS]).delete()


class Migration(migrations.Migration):
    dependencies = [('social', '0009_question_depth_question_styles_questionskip')]
    operations = [migrations.RunPython(add_questions, remove_questions)]
