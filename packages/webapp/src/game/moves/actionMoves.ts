import { MoveFn } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { Deck } from '../deck';
import { Cards } from '../cards';
import { isInRange } from '../utils';
import { ActiveProject, ActiveProjects } from '../activeProjects';

export const createProject: MoveFn<OpenStarTerVillageType.State.Root> = ({ G, ctx, playerID }, projectCardIndex: number, jobCardIndex: number) => {
  if (!G.table.activeMoves.createProject) {
    return INVALID_MOVE;
  }

  const currentPlayer = playerID!;
  const currentPlayerToken = G.players[currentPlayer].token;
  // TODO: replace hardcoded number with dynamic rules
  const createProjectActionCosts = 2;
  if (currentPlayerToken.actions < createProjectActionCosts) {
    return INVALID_MOVE;
  }
  const createProjectWorkerCosts = 1;
  if (currentPlayerToken.workers < createProjectWorkerCosts) {
    return INVALID_MOVE;
  }

  // check project card in in hand
  const currentHandProjects = G.players[currentPlayer].hand.projects;
  if (!isInRange(projectCardIndex, currentHandProjects.length)) {
    return INVALID_MOVE;
  }

  // check job card is on the table
  const currentJobs = G.table.activeJobs;
  if (!isInRange(jobCardIndex, currentJobs.length)) {
    return INVALID_MOVE;
  }

  // check job card is required in project
  const projectCard = Cards.GetById(currentHandProjects, projectCardIndex);
  const jobCard = Cards.GetById(currentJobs, jobCardIndex);
  if (!Object.keys(projectCard.requirements).includes(jobCard.name)) {
    return INVALID_MOVE;
  }

  // reduce action tokens
  currentPlayerToken.actions -= createProjectActionCosts;
  Cards.RemoveOne(currentHandProjects, projectCard);
  Cards.RemoveOne(currentJobs, jobCard);

  // initial active project
  const activeProjectIndex = ActiveProjects.Add(G.table.activeProjects, projectCard, currentPlayer);
  const activeProject = ActiveProjects.GetById(G.table.activeProjects, activeProjectIndex);

  // reduce worker token
  currentPlayerToken.workers -= createProjectWorkerCosts;
  // assign worker token
  const jobInitPoints = 1;
  ActiveProject.AssignWorker(activeProject, jobCard.name, currentPlayer, jobInitPoints);
  // score victory points
  const createProjectVictoryPoints = 1;
  G.players[currentPlayer].victoryPoints += createProjectVictoryPoints;

  // discard job card
  Deck.Discard(G.decks.jobs, [jobCard]);

  // Refill job card
  const maxJobCards = 5;
  const refillCardNumber = maxJobCards - currentJobs.length;
  const jobCards = Deck.Draw(G.decks.jobs, refillCardNumber);
  Cards.Add(currentJobs, jobCards);

  G.table.activeMoves.createProject = false;
}

export const recruit: MoveFn<OpenStarTerVillageType.State.Root> = ({G, ctx, playerID}, jobCardIndex: number, activeProjectIndex: number) => {
  if (!G.table.activeMoves.recruit) {
    return INVALID_MOVE;
  }

  const currentPlayer = playerID!;
  const currentPlayerToken = G.players[currentPlayer].token;
  const recruitActionCosts = 1;
  if (currentPlayerToken.actions < recruitActionCosts) {
    return INVALID_MOVE;
  }
  const recruitWorkerCosts = 1;
  if (currentPlayerToken.workers < recruitWorkerCosts) {
    return INVALID_MOVE;
  }

  const currentJobs = G.table.activeJobs;
  if (!isInRange(jobCardIndex, currentJobs.length)) {
    return INVALID_MOVE;
  }

  const activeProjects = G.table.activeProjects
  if (!isInRange(activeProjectIndex, activeProjects.length)) {
    return INVALID_MOVE;
  }
  const jobCard = Cards.GetById(currentJobs, jobCardIndex);
  const activeProject = ActiveProjects.GetById(G.table.activeProjects, activeProjectIndex);
  const jobContribution = ActiveProject.GetJobContribution(activeProject, jobCard.name);
  // Check job requirment is not fulfilled yet
  if (!(jobContribution < activeProject.card.requirements[jobCard.name])) {
    return INVALID_MOVE;
  }
  // User cannot place more than one worker in same job
  if (ActiveProject.HasWorker(activeProject, jobCard.name, currentPlayer)) {
    return INVALID_MOVE;
  }

  // reduce action
  currentPlayerToken.actions -= recruitActionCosts;
  Cards.RemoveOne(currentJobs, jobCard);

  // reduce worker tokens
  currentPlayerToken.workers -= recruitWorkerCosts;
  // assign worker token
  const jobInitPoints = 1;
  ActiveProject.AssignWorker(activeProject, jobCard.name, currentPlayer, jobInitPoints);

  // discard job card
  Deck.Discard(G.decks.jobs, [jobCard]);

  // Refill job card
  const maxJobCards = 5;
  const refillCardNumber = maxJobCards - currentJobs.length;
  const jobCards = Deck.Draw(G.decks.jobs, refillCardNumber);
  Cards.Add(currentJobs, jobCards);

  G.table.activeMoves.recruit = false;
};

export const contributeOwnedProjects: MoveFn<OpenStarTerVillageType.State.Root> = ({G, ctx, playerID}, contributions: OpenStarTerVillageType.Move.Contribution[]) => {
  if (!G.table.activeMoves.contributeOwnedProjects) {
    return INVALID_MOVE;
  }

  const currentPlayer = playerID!;
  const currentPlayerToken = G.players[currentPlayer].token;
  const contributeActionCosts = 1;
  if (currentPlayerToken.actions < contributeActionCosts) {
    return INVALID_MOVE;
  }
  const activeProjects = G.table.activeProjects
  const isInvalid = contributions.map(({ activeProjectIndex, jobName }) => {
    if (!isInRange(activeProjectIndex, activeProjects.length)) {
      return true;
    }
    const activeProject = ActiveProjects.GetById(activeProjects, activeProjectIndex);
    if (activeProject.owner !== currentPlayer) {
      return true;
    }

    if (!ActiveProject.HasWorker(activeProject, jobName, currentPlayer)) {
      return true;
    }
  }).some(x => x);
  if (isInvalid) {
    return INVALID_MOVE;
  }
  const totalContributions = contributions.map(({ value }) => value).reduce((a, b) => a + b, 0);
  const maxOwnedContributions = 4;
  if (!(totalContributions <= maxOwnedContributions)) {
    return INVALID_MOVE;
  }

  // deduct action tokens
  currentPlayerToken.actions -= contributeActionCosts;
  contributions.forEach(({ activeProjectIndex, jobName, value }) => {
    // update contributions to given contribution points
    const activeProject = ActiveProjects.GetById(G.table.activeProjects, activeProjectIndex);
    ActiveProject.PushWorker(activeProject, jobName, currentPlayer, value);
  });

  G.table.activeMoves.contributeOwnedProjects = false;
};

export const contributeJoinedProjects: MoveFn<OpenStarTerVillageType.State.Root> = ({G, ctx, playerID}, contributions: OpenStarTerVillageType.Move.Contribution[]) => {
  if (!G.table.activeMoves.contributeJoinedProjects) {
    return INVALID_MOVE;
  }

  const currentPlayer = playerID!;
  const currentPlayerToken = G.players[currentPlayer].token;
  const contributeActionCosts = 1;
  if (currentPlayerToken.actions < contributeActionCosts) {
    return INVALID_MOVE;
  }
  const activeProjects = G.table.activeProjects
  const isInvalid = contributions.map(({ activeProjectIndex, jobName }) => {
    if (!isInRange(activeProjectIndex, activeProjects.length)) {
      return true;
    }
    const activeProject = ActiveProjects.GetById(activeProjects, activeProjectIndex);
    if (activeProject.owner === currentPlayer) {
      return true;
    }

    if (!ActiveProject.HasWorker(activeProject, jobName, currentPlayer)) {
      return true;
    }
  }).some(x => x);
  if (isInvalid) {
    return INVALID_MOVE;
  }
  const totalContributions = contributions.map(({ value }) => value).reduce((a, b) => a + b, 0);
  const maxJoinedContributions = 3;
  if (!(totalContributions <= maxJoinedContributions)) {
    return INVALID_MOVE;
  }

  // deduct action tokens
  currentPlayerToken.actions -= contributeActionCosts;
  contributions.forEach(({ activeProjectIndex, jobName, value }) => {
    // update contributions to given contribution points
    const activeProject = ActiveProjects.GetById(G.table.activeProjects, activeProjectIndex);
    ActiveProject.PushWorker(activeProject, jobName, currentPlayer, value);
  });

  G.table.activeMoves.contributeJoinedProjects = false;
};

export const removeAndRefillJobs: MoveFn<OpenStarTerVillageType.State.Root> = ({G, ctx}, jobCardIndices: number[]) => {
  if (!G.table.activeMoves.removeAndRefillJobs) {
    return INVALID_MOVE;
  }

  const currentJob = G.table.activeJobs;
  const jobDeck = G.decks.jobs;
  const isInvalid = jobCardIndices.map(index => !isInRange(index, currentJob.length)).some(x => x);
  if (isInvalid) {
    return INVALID_MOVE;
  }
  const removedJobCards = jobCardIndices.map(index => currentJob[index]);
  Cards.Remove(currentJob, removedJobCards);
  Deck.Discard(jobDeck, removedJobCards);

  const maxJobCards = 5;
  const refillCardNumber = maxJobCards - currentJob.length;
  const jobCards = Deck.Draw(jobDeck, refillCardNumber);
  Cards.Add(currentJob, jobCards);

  G.table.activeMoves.removeAndRefillJobs = false;
};

export const mirror: MoveFn<OpenStarTerVillageType.State.Root> = (context, actionName, ...params) => {
  const { G } = context;
  if (!G.table.activeMoves.mirror) {
    return INVALID_MOVE;
  }

  // TODO: add token to bypass the active moves check when its inactive

  let result = null;
  switch (actionName) {
    case 'createProject':
      result = createProject(context, ...(params as Parameters<OpenStarTerVillageType.Move.CreateProject>));
      break;
    case 'recruit':
      result = recruit(context, ...(params as Parameters<OpenStarTerVillageType.Move.Recruit>));
      break;
    case 'contributeOwnedProjects':
      result = contributeOwnedProjects(context, ...(params as Parameters<OpenStarTerVillageType.Move.ContributeOwnedProjects>));
      break;
    case 'contributeJoinedProjects':
      result = contributeJoinedProjects(context, ...(params as Parameters<OpenStarTerVillageType.Move.ContributeJoinedProjects>));
      break;
    case 'removeAndRefillJobs':
      result = removeAndRefillJobs(context, ...(params as Parameters<OpenStarTerVillageType.Move.RemoveAndRefillJobs>));
      break;
    default:
      result = INVALID_MOVE;
      break;
  }

  // TODO: remove the token

  if (result === INVALID_MOVE) {
    return INVALID_MOVE;
  }

  G.table.activeMoves.mirror = false;
};
