import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import Categories from './Community/Categories';
import Interpretations from './Community/Interpretations';
import Polls from './Community/Polls';
import Mentorship from './Community/Mentorship';
import Events from './Community/Events';
import Groups from './Community/Groups';
import Guidelines from './Community/Guidelines';

export default function Community() {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dream Community</h1>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 gap-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="interpretations">Interpretations</TabsTrigger>
          <TabsTrigger value="polls">Polls</TabsTrigger>
          <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="categories">
            <Categories />
          </TabsContent>
          <TabsContent value="interpretations">
            <Interpretations />
          </TabsContent>
          <TabsContent value="polls">
            <Polls />
          </TabsContent>
          <TabsContent value="mentorship">
            <Mentorship />
          </TabsContent>
          <TabsContent value="events">
            <Events />
          </TabsContent>
          <TabsContent value="groups">
            <Groups />
          </TabsContent>
          <TabsContent value="guidelines">
            <Guidelines />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}